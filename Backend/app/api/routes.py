from __future__ import annotations

import asyncio
import json
import logging
import os
import pickle
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, Request
from fastapi import Query
from fastapi import UploadFile
from fastapi import WebSocket, WebSocketDisconnect

from app.core.config import Settings
from app.core.rate_limit import InMemoryRateLimiter
from app.core.response import make_response
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    require_roles,
    validate_admin_token,
    verify_password,
)
from app.schemas.requests import (
    CompareAnswerRequest,
    ConfigUpdateRequest,
    FacultyRegisterRequest,
    LoginRequest,
    MisEvaluationReportRequest,
    SearchAnswersRequest,
    StudentRegisterRequest,
    TrainModelRequest,
)
from app.services.engine import EvaluationEngine
from app.services.file_service import FileService
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)
router = APIRouter()

_DEFAULT_TRAIN_TARGETS = ["concept_coverage", "correctness", "depth", "relevance"]


def _get_training_api_key() -> str:
    return os.getenv("TRAINING_API_KEY", "").strip()


def _validate_training_auth(request: Request) -> None:
    configured = _get_training_api_key()
    if not configured:
        return

    auth = request.headers.get("authorization", "").strip()
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token for training API")
    token = auth[7:].strip()
    if token != configured:
        raise HTTPException(status_code=401, detail="Invalid training API token")


def _resolve_workspace_path(raw_path: str) -> Path:
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = (Path.cwd() / candidate).resolve()
    else:
        candidate = candidate.resolve()

    workspace_root = Path.cwd().resolve()
    if candidate != workspace_root and workspace_root not in candidate.parents:
        raise HTTPException(status_code=400, detail="Path must be inside project workspace")
    return candidate


async def _broadcast_progress(app: FastAPI, job_id: str, payload: dict[str, Any]) -> None:
    connections = app.state.runtime.batch_connections.get(job_id, [])
    if not connections:
        return

    stale: list[WebSocket] = []
    for ws in connections:
        try:
            await ws.send_json(payload)
        except Exception:  # noqa: BLE001
            stale.append(ws)

    if stale:
        app.state.runtime.batch_connections[job_id] = [ws for ws in connections if ws not in stale]


def _ws_url_from_request(request: Request, job_id: str) -> str:
    proto = "wss" if request.url.scheme == "https" else "ws"
    host = request.headers.get("host", "127.0.0.1:8000")
    return f"{proto}://{host}/ws/batch/{job_id}"


def _parse_rubric(rubric: str | None) -> dict[str, Any] | None:
    if not rubric:
        return None
    try:
        value = json.loads(rubric)
        return value if isinstance(value, dict) else {"raw": rubric}
    except Exception:  # noqa: BLE001
        return {"raw": rubric}


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _sanitize_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": user.get("user_id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role"),
        "faculty_id": user.get("faculty_id"),
        "roll_number": user.get("roll_number"),
        "department": user.get("department"),
        "branch": user.get("branch"),
        "section": user.get("section"),
        "created_at": user.get("created_at"),
    }


@router.post("/auth/register/faculty")
async def register_faculty(request: Request, payload: FacultyRegisterRequest) -> dict[str, Any]:
    app: FastAPI = request.app
    email = _normalize_email(payload.email)

    existing = await app.state.users_repo.get_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "faculty",
        "faculty_id": payload.faculty_id.strip(),
        "department": payload.department.strip(),
        "branch": None,
        "section": None,
        "roll_number": None,
    }
    inserted = await app.state.users_repo.insert_user(user_doc)
    if not inserted:
        raise HTTPException(status_code=503, detail="User storage is unavailable")

    token = create_access_token(
        {
            "sub": user_id,
            "email": email,
            "role": "faculty",
            "name": payload.name.strip(),
            "profile_id": payload.faculty_id.strip(),
        }
    )
    return make_response(
        status="success",
        request_id=f"register:{user_id}",
        data={"access_token": token, "token_type": "bearer", "user": _sanitize_user(user_doc)},
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.post("/auth/register/student")
async def register_student(request: Request, payload: StudentRegisterRequest) -> dict[str, Any]:
    app: FastAPI = request.app
    email = _normalize_email(payload.email)

    existing = await app.state.users_repo.get_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "student",
        "faculty_id": None,
        "department": None,
        "roll_number": payload.roll_number.strip(),
        "branch": payload.branch.strip(),
        "section": payload.section.strip(),
    }
    inserted = await app.state.users_repo.insert_user(user_doc)
    if not inserted:
        raise HTTPException(status_code=503, detail="User storage is unavailable")

    token = create_access_token(
        {
            "sub": user_id,
            "email": email,
            "role": "student",
            "name": payload.name.strip(),
            "profile_id": payload.roll_number.strip(),
            "branch": payload.branch.strip(),
            "section": payload.section.strip(),
        }
    )
    return make_response(
        status="success",
        request_id=f"register:{user_id}",
        data={"access_token": token, "token_type": "bearer", "user": _sanitize_user(user_doc)},
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.post("/auth/login")
async def login(request: Request, payload: LoginRequest) -> dict[str, Any]:
    app: FastAPI = request.app
    email = _normalize_email(payload.email)
    user = await app.state.users_repo.get_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, str(user.get("password_hash", ""))):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_payload = {
        "sub": user.get("user_id"),
        "email": user.get("email"),
        "role": user.get("role"),
        "name": user.get("name"),
        "profile_id": user.get("roll_number") or user.get("faculty_id") or user.get("user_id"),
        "branch": user.get("branch"),
        "section": user.get("section"),
    }
    token = create_access_token(token_payload)
    return make_response(
        status="success",
        request_id=f"login:{user.get('user_id')}",
        data={"access_token": token, "token_type": "bearer", "user": _sanitize_user(user)},
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.get("/auth/me")
async def auth_me(user: dict[str, Any] = Depends(require_roles("faculty", "student", "admin"))) -> dict[str, Any]:
    return make_response(
        status="success",
        request_id="auth:me",
        data={"user": user},
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.post("/evaluate")
async def evaluate_single(
    request: Request,
    file: UploadFile = File(...),
    rubric: str | None = Form(default=None),
    student_id: str | None = Form(default=None),
    user: dict[str, Any] = Depends(require_roles("faculty", "admin")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    settings: Settings = app.state.settings
    limiter: InMemoryRateLimiter = app.state.rate_limiter
    engine: EvaluationEngine = app.state.engine
    file_service: FileService = app.state.file_service

    await limiter.check(request, "evaluate", settings.rate_limit_evaluate)
    request_id = str(uuid.uuid4())
    app.state.runtime.queue_depth += 1
    started = time.perf_counter()
    try:
        content, _safe_name = await file_service.validate_and_read(file)
        result = await engine.evaluate(content, _parse_rubric(rubric), request_id=request_id)

        envelope = make_response(
            status=result.get("status", "success"),
            request_id=request_id,
            data=result,
            confidence=float(result.get("overall_confidence", 0.0)),
            processing_time_ms=float(result.get("processing_time", 0.0)),
        )

        await app.state.evaluations_repo.insert_evaluation(
            {
                "request_id": request_id,
                "scores": {
                    "semantic_score": result.get("semantic_score"),
                    "keyword_score": result.get("keyword_score"),
                    "final_marks": result.get("final_marks"),
                    "max_marks": result.get("max_marks"),
                },
                "confidence": result.get("overall_confidence", 0.0),
                "status": result.get("status", "success"),
                "recognized_text": result.get("recognized_text", ""),
                "manual_review_flag": result.get("needs_manual_review", False),
                "processing_time": result.get("processing_time", 0.0),
                "student_id": student_id,
                "created_by": user.get("sub"),
                "created_by_role": user.get("role"),
            }
        )
        return envelope
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.error("/evaluate failed", extra={"extra_fields": {"error": str(exc), "request_id": request_id}})
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        app.state.runtime.queue_depth = max(0, app.state.runtime.queue_depth - 1)
        latency_ms = round((time.perf_counter() - started) * 1000, 2)
        app.state.runtime.record_latency(latency_ms)
        if latency_ms > 4000:
            logger.warning(
                "slow_request",
                extra={"extra_fields": {"path": "/evaluate", "latency_ms": latency_ms, "request_id": request_id}},
            )


@router.post("/evaluate/batch")
async def evaluate_batch(
    request: Request,
    files: list[UploadFile] = File(...),
    rubric: str | None = Form(default=None),
    student_ids: str | None = Form(default=None),
    user: dict[str, Any] = Depends(require_roles("faculty", "admin")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    settings: Settings = app.state.settings
    limiter: InMemoryRateLimiter = app.state.rate_limiter
    engine: EvaluationEngine = app.state.engine
    file_service: FileService = app.state.file_service

    await limiter.check(request, "batch", settings.rate_limit_batch)
    request_id = str(uuid.uuid4())
    sem = asyncio.Semaphore(settings.batch_max_parallelism)
    rubric_obj = _parse_rubric(rubric)

    parsed_student_ids: list[str] = []
    if student_ids:
        try:
            value = json.loads(student_ids)
            if isinstance(value, list):
                parsed_student_ids = [str(v).strip() for v in value]
        except Exception:  # noqa: BLE001
            parsed_student_ids = []

    async def _one(index: int, upload: UploadFile) -> dict[str, Any]:
        async with sem:
            try:
                content, _safe_name = await file_service.validate_and_read(upload)
                item = await engine.evaluate(content, rubric_obj, request_id=f"{request_id}:{index}")
                item["item_index"] = index
                return item
            except Exception as exc:  # noqa: BLE001
                return {
                    "item_index": index,
                    "status": "error",
                    "overall_confidence": 0.0,
                    "processing_time": 0.0,
                    "error": str(exc),
                    "needs_manual_review": True,
                }

    started = time.perf_counter()
    tasks = [_one(i, f) for i, f in enumerate(files)]
    items = await asyncio.gather(*tasks, return_exceptions=False)
    processing = round((time.perf_counter() - started) * 1000, 2)
    app.state.runtime.record_latency(processing)

    successes = [i for i in items if i.get("status") != "error"]
    avg_conf = round(sum(float(i.get("overall_confidence", 0.0)) for i in items) / len(items), 4) if items else 0.0
    status = "error" if not successes else ("pending_review" if any(i.get("needs_manual_review") for i in items) else "success")

    for item in successes:
        index = int(item.get("item_index", 0))
        mapped_student = parsed_student_ids[index] if index < len(parsed_student_ids) else None
        await app.state.evaluations_repo.insert_evaluation(
            {
                "request_id": f"{request_id}:{index}",
                "scores": {
                    "semantic_score": item.get("semantic_score"),
                    "keyword_score": item.get("keyword_score"),
                    "final_marks": item.get("final_marks"),
                    "max_marks": item.get("max_marks"),
                },
                "confidence": item.get("overall_confidence", 0.0),
                "status": item.get("status", "success"),
                "recognized_text": item.get("recognized_text", ""),
                "manual_review_flag": item.get("needs_manual_review", False),
                "processing_time": item.get("processing_time", 0.0),
                "student_id": mapped_student,
                "batch_id": request_id,
                "created_by": user.get("sub"),
                "created_by_role": user.get("role"),
            }
        )

    if app.state.mongo.available and app.state.mongo.db is not None:
        await app.state.mongo.db["batch_jobs"].update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "request_id": request_id,
                    "created_by": user.get("sub"),
                    "created_by_role": user.get("role"),
                    "status": status,
                    "total_files": len(files),
                    "completed_files": len(successes),
                    "avg_confidence": avg_conf,
                    "processing_time": processing,
                    "timestamp": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

    return make_response(
        status=status,
        request_id=request_id,
        data={"items": items, "count": len(items)},
        confidence=avg_conf,
        processing_time_ms=processing,
    )


@router.post("/evaluate/batch/async")
async def evaluate_batch_async(
    request: Request,
    files: list[UploadFile] = File(...),
    rubric: str | None = Form(default=None),
    student_ids: str | None = Form(default=None),
    user: dict[str, Any] = Depends(require_roles("faculty", "admin")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    settings: Settings = app.state.settings
    limiter: InMemoryRateLimiter = app.state.rate_limiter
    engine: EvaluationEngine = app.state.engine
    file_service: FileService = app.state.file_service

    await limiter.check(request, "batch", settings.rate_limit_batch)
    request_id = str(uuid.uuid4())
    rubric_obj = _parse_rubric(rubric)

    parsed_student_ids: list[str] = []
    if student_ids:
        try:
            value = json.loads(student_ids)
            if isinstance(value, list):
                parsed_student_ids = [str(v).strip() for v in value]
        except Exception:  # noqa: BLE001
            parsed_student_ids = []

    validated: list[tuple[str, bytes]] = []
    for upload in files:
        content, safe_name = await file_service.validate_and_read(upload)
        validated.append((safe_name, content))

    total = len(validated)
    if app.state.mongo.available and app.state.mongo.db is not None:
        await app.state.mongo.db["batch_jobs"].update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "request_id": request_id,
                    "created_by": user.get("sub"),
                    "created_by_role": user.get("role"),
                    "status": "running",
                    "total_files": total,
                    "completed_files": 0,
                    "avg_confidence": 0.0,
                    "processing_time": 0.0,
                    "items": [],
                    "timestamp": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

    async def _runner() -> None:
        sem = asyncio.Semaphore(settings.batch_max_parallelism)
        started = time.perf_counter()
        items: list[dict[str, Any]] = []
        confidences: list[float] = []

        async def _one(index: int, safe_name: str, content: bytes) -> dict[str, Any]:
            async with sem:
                try:
                    item = await engine.evaluate(content, rubric_obj, request_id=f"{request_id}:{index}")
                    item["item_index"] = index
                    item["file_name"] = safe_name
                    return item
                except Exception as exc:  # noqa: BLE001
                    return {
                        "item_index": index,
                        "file_name": safe_name,
                        "status": "error",
                        "overall_confidence": 0.0,
                        "processing_time": 0.0,
                        "error": str(exc),
                        "needs_manual_review": True,
                    }

        tasks = [asyncio.create_task(_one(i, n, c)) for i, (n, c) in enumerate(validated)]
        completed = 0

        for task in asyncio.as_completed(tasks):
            item = await task
            items.append(item)
            completed += 1
            conf = float(item.get("overall_confidence", 0.0))
            confidences.append(conf)
            avg_conf_now = round(sum(confidences) / len(confidences), 4) if confidences else 0.0

            await _broadcast_progress(
                app,
                request_id,
                {
                    "type": "progress",
                    "job_id": request_id,
                    "total": total,
                    "completed": completed,
                    "percent": round((completed / max(total, 1)) * 100, 2),
                    "latest": item,
                    "avg_confidence": avg_conf_now,
                },
            )

            if app.state.mongo.available and app.state.mongo.db is not None:
                await app.state.mongo.db["batch_jobs"].update_one(
                    {"request_id": request_id},
                    {
                        "$set": {
                            "status": "running",
                            "completed_files": completed,
                            "avg_confidence": avg_conf_now,
                            "items": items,
                            "updated_at": datetime.now(timezone.utc),
                        }
                    },
                    upsert=True,
                )

        processing = round((time.perf_counter() - started) * 1000, 2)
        successes = [i for i in items if i.get("status") != "error"]
        status = "error" if not successes else ("pending_review" if any(i.get("needs_manual_review") for i in items) else "success")
        avg_conf = round(sum(float(i.get("overall_confidence", 0.0)) for i in items) / len(items), 4) if items else 0.0

        for item in successes:
            index = int(item.get("item_index", 0))
            mapped_student = parsed_student_ids[index] if index < len(parsed_student_ids) else None
            await app.state.evaluations_repo.insert_evaluation(
                {
                    "request_id": f"{request_id}:{index}",
                    "scores": {
                        "semantic_score": item.get("semantic_score"),
                        "keyword_score": item.get("keyword_score"),
                        "final_marks": item.get("final_marks"),
                        "max_marks": item.get("max_marks"),
                    },
                    "confidence": item.get("overall_confidence", 0.0),
                    "status": item.get("status", "success"),
                    "recognized_text": item.get("recognized_text", ""),
                    "manual_review_flag": item.get("needs_manual_review", False),
                    "processing_time": item.get("processing_time", 0.0),
                    "student_id": mapped_student,
                    "batch_id": request_id,
                    "created_by": user.get("sub"),
                    "created_by_role": user.get("role"),
                }
            )

        if app.state.mongo.available and app.state.mongo.db is not None:
            await app.state.mongo.db["batch_jobs"].update_one(
                {"request_id": request_id},
                {
                    "$set": {
                        "status": status,
                        "completed_files": len(items),
                        "avg_confidence": avg_conf,
                        "processing_time": processing,
                        "items": items,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
            )

        await _broadcast_progress(
            app,
            request_id,
            {
                "type": "done",
                "job_id": request_id,
                "total": total,
                "completed": len(items),
                "percent": 100,
                "status": status,
                "items": items,
                "avg_confidence": avg_conf,
                "processing_time": processing,
            },
        )

    asyncio.create_task(_runner())

    return make_response(
        status="success",
        request_id=request_id,
        data={
            "job_id": request_id,
            "status": "running",
            "total_files": total,
            "websocket_url": _ws_url_from_request(request, request_id),
        },
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.get("/batch-jobs/{job_id}")
async def get_batch_job(
    request: Request,
    job_id: str,
    user: dict[str, Any] = Depends(require_roles("faculty", "admin")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    if (not app.state.mongo.available) or (app.state.mongo.db is None):
        raise HTTPException(status_code=503, detail="Batch job tracking unavailable without MongoDB")

    job = await app.state.mongo.db["batch_jobs"].find_one({"request_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    if job.get("created_by") != user.get("sub") and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    return make_response(
        status="success",
        request_id=f"batch-job:{job_id}",
        data=job,
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.websocket("/ws/batch/{job_id}")
async def ws_batch_progress(websocket: WebSocket, job_id: str) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401)
        return

    try:
        user = decode_access_token(token)
    except HTTPException:
        await websocket.close(code=4401)
        return

    if user.get("role") not in {"faculty", "admin"}:
        await websocket.close(code=4403)
        return

    await websocket.accept()
    app: FastAPI = websocket.app  # type: ignore[assignment]
    app.state.runtime.batch_connections.setdefault(job_id, []).append(websocket)

    try:
        if app.state.mongo.available and app.state.mongo.db is not None:
            job = await app.state.mongo.db["batch_jobs"].find_one({"request_id": job_id}, {"_id": 0})
            if job and job.get("created_by") == user.get("sub"):
                total = int(job.get("total_files", 0) or 0)
                completed = int(job.get("completed_files", 0) or 0)
                await websocket.send_json(
                    {
                        "type": "snapshot",
                        "job_id": job_id,
                        "status": job.get("status", "running"),
                        "total": total,
                        "completed": completed,
                        "percent": round((completed / max(total, 1)) * 100, 2),
                        "items": job.get("items", []),
                    }
                )

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        current = app.state.runtime.batch_connections.get(job_id, [])
        app.state.runtime.batch_connections[job_id] = [ws for ws in current if ws is not websocket]


@router.get("/results")
async def list_results(
    request: Request,
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=120),
    status: str | None = Query(default=None, max_length=40),
    user: dict[str, Any] = Depends(require_roles("faculty", "student", "admin")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    role = user.get("role")
    student_id = user.get("profile_id") if role == "student" else None
    data = await app.state.evaluations_repo.list_results(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        student_id=student_id,
    )
    return make_response(
        status="success",
        request_id="results:list",
        data={
            **data,
            "page": page,
            "page_size": page_size,
            "role": role,
        },
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.get("/results/class-summary")
async def class_summary(
    request: Request,
    user: dict[str, Any] = Depends(require_roles("student")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    branch = user.get("branch")
    section = user.get("section")
    if not branch or not section:
        raise HTTPException(status_code=400, detail="Student profile missing branch/section")

    students = await app.state.users_repo.list_students_by_branch_section(branch=branch, section=section)
    student_ids = [str(s.get("roll_number")) for s in students if s.get("roll_number")]
    summary = await app.state.evaluations_repo.get_class_result_summary(student_ids)

    my_id = user.get("profile_id")
    my_rank = None
    for s in summary.get("students", []):
        if s.get("student_id") == my_id:
            my_rank = s.get("rank")
            break

    return make_response(
        status="success",
        request_id="results:class-summary",
        data={
            "branch": branch,
            "section": section,
            "my_rank": my_rank,
            **summary,
        },
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.post("/results/{request_id}/report")
async def report_mis_evaluation(
    request: Request,
    request_id: str,
    payload: MisEvaluationReportRequest,
    user: dict[str, Any] = Depends(require_roles("student")),
) -> dict[str, Any]:
    app: FastAPI = request.app
    student_id = str(user.get("profile_id") or "").strip()
    if not student_id:
        raise HTTPException(status_code=400, detail="Student profile missing roll number")

    existing = await app.state.evaluations_repo.get_by_request_id(request_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Result not found")

    if str(existing.get("student_id") or "").strip() != student_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    updated = await app.state.evaluations_repo.add_mis_evaluation_report(
        request_id=request_id,
        reporter_student_id=student_id,
        reason=payload.reason,
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to submit report")

    return make_response(
        status="success",
        request_id=f"results:report:{request_id}",
        data={
            "request_id": request_id,
            "student_id": student_id,
            "reported": True,
            "status": "pending_review",
        },
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.post("/search/answers")
async def search_answers(request: Request, payload: SearchAnswersRequest) -> dict[str, Any]:
    app: FastAPI = request.app
    settings: Settings = app.state.settings
    limiter: InMemoryRateLimiter = app.state.rate_limiter
    search_service: SearchService = app.state.search_service

    await limiter.check(request, "search_answers", settings.rate_limit_search)
    request_id = str(uuid.uuid4())
    started = time.perf_counter()

    async def provider(query: str) -> list[dict]:
        return await search_service.ai_search_answers(query, payload.sources)

    results = await search_service.search_answers(payload.query, provider)
    latency_ms = round((time.perf_counter() - started) * 1000, 2)
    await app.state.search_repo.log_search(payload.query, len(results), latency_ms)
    return make_response(
        status="success",
        request_id=request_id,
        data=results,
        confidence=1.0,
        processing_time_ms=latency_ms,
    )


@router.post("/search/compare")
async def compare_answer(request: Request, payload: CompareAnswerRequest) -> dict[str, Any]:
    app: FastAPI = request.app
    settings: Settings = app.state.settings
    limiter: InMemoryRateLimiter = app.state.rate_limiter
    await limiter.check(request, "search_compare", settings.rate_limit_search)

    request_id = str(uuid.uuid4())
    search_service: SearchService = app.state.search_service
    data = await search_service.ai_compare_answer(payload.student_answer, payload.reference_answers or [])
    avg = float(data.get("average_similarity", 0.0))
    return make_response(
        status="success",
        request_id=request_id,
        data=data,
        confidence=avg,
        processing_time_ms=1.0,
    )


@router.post("/train")
async def train_model(request: Request, payload: TrainModelRequest) -> dict[str, Any]:
    _validate_training_auth(request)
    started = time.perf_counter()
    request_id = f"train:{uuid.uuid4()}"

    dataset_path = _resolve_workspace_path(payload.dataset_path)
    if not dataset_path.exists() or not dataset_path.is_file():
        raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset_path}")

    target_columns = payload.target_columns or _DEFAULT_TRAIN_TARGETS
    if len(target_columns) != 4:
        raise HTTPException(status_code=400, detail="target_columns must contain exactly 4 rubric components")

    try:
        import numpy as np
        import pandas as pd
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics import mean_absolute_error, mean_squared_error
        from sklearn.model_selection import train_test_split
        from sklearn.multioutput import MultiOutputRegressor
        from sklearn.pipeline import Pipeline
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail="Training dependencies missing. Install pandas, numpy, and scikit-learn.",
        ) from exc

    try:
        df = pd.read_pickle(dataset_path)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Failed to read dataset pickle: {exc}") from exc

    required_base = {"question", "reference_answer", "student_answer"}
    missing_base = sorted(required_base - set(df.columns))
    missing_targets = sorted(set(target_columns) - set(df.columns))
    if missing_base:
        raise HTTPException(status_code=400, detail=f"Dataset missing required text columns: {missing_base}")
    if missing_targets:
        raise HTTPException(status_code=400, detail=f"Dataset missing target columns: {missing_targets}")

    if "text_input" not in df.columns:
        df["text_input"] = (
            "Question: "
            + df["question"].astype(str)
            + "\nReference: "
            + df["reference_answer"].astype(str)
            + "\nStudent: "
            + df["student_answer"].astype(str)
        )

    if len(df) < 4:
        raise HTTPException(status_code=400, detail="Dataset too small for training. Provide at least 4 rows.")

    X = df["text_input"].astype(str)
    y = df[target_columns]

    try:
        X_train, X_val, y_train, y_val = train_test_split(
            X,
            y,
            test_size=payload.test_size,
            random_state=payload.random_state,
            shuffle=True,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Unable to split data: {exc}") from exc

    pipeline = Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=15000)),
            ("reg", MultiOutputRegressor(RandomForestRegressor(n_estimators=220, random_state=payload.random_state, n_jobs=-1))),
        ]
    )

    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_val)

    pred_df = pd.DataFrame(pred, columns=target_columns)
    clamp_ranges = {
        "concept_coverage": (0.0, 4.0),
        "correctness": (0.0, 3.0),
        "depth": (0.0, 2.0),
        "relevance": (0.0, 1.0),
    }
    for col in target_columns:
        low, high = clamp_ranges.get(col, (0.0, 10.0))
        pred_df[col] = pred_df[col].clip(low, high)

    pred_total = pred_df.sum(axis=1)
    true_total = y_val.sum(axis=1)

    metrics = {
        "components_mae": float(mean_absolute_error(y_val, pred_df)),
        "total_mae": float(mean_absolute_error(true_total, pred_total)),
        "total_rmse": float(np.sqrt(mean_squared_error(true_total, pred_total))),
    }

    model_id = str(uuid.uuid4())
    default_model_path = Path.cwd() / "Backend" / "results" / "answer_evaluator_model.pkl"
    output_model_path = _resolve_workspace_path(payload.output_model_path) if payload.output_model_path else default_model_path.resolve()
    output_model_path.parent.mkdir(parents=True, exist_ok=True)

    model_artifact = {
        "artifact_type": "answer_evaluator_baseline",
        "model_id": model_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "task": payload.task,
        "dataset_path": str(dataset_path),
        "target_columns": target_columns,
        "pipeline": pipeline,
        "metrics": metrics,
        "metadata": payload.metadata or {},
    }

    try:
        with output_model_path.open("wb") as f:
            pickle.dump(model_artifact, f)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Failed to save model artifact: {exc}") from exc

    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    return make_response(
        status="success",
        request_id=request_id,
        data={
            "model_id": model_id,
            "task": payload.task,
            "dataset_rows": int(len(df)),
            "dataset_path": str(dataset_path),
            "model_path": str(output_model_path),
            "target_columns": target_columns,
            "metrics": metrics,
        },
        confidence=1.0,
        processing_time_ms=duration_ms,
    )


@router.get("/health")
async def health(request: Request) -> dict[str, Any]:
    app: FastAPI = request.app
    mongo_ok = await app.state.mongo.ping()
    health_payload = {
        "api_status": "ready" if app.state.runtime.ready else "starting",
        "mongo_status": "up" if mongo_ok else "degraded",
        "engine_mode": app.state.engine.mode,
        "gemini_enabled": bool(app.state.settings.gemini_api_key.strip()),
        "handwriting_model_loaded": app.state.engine.handwriting_model_loaded,
        "cuda_available": False,
        "queue_depth": app.state.runtime.queue_depth,
        "avg_latency": app.state.runtime.avg_latency,
        "model_status": "loaded" if app.state.runtime.ready else "warming",
        "version": app.state.settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    return make_response(
        status="success" if app.state.runtime.ready else "pending_review",
        request_id="health",
        data=health_payload,
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.get("/stats")
async def stats(request: Request) -> dict[str, Any]:
    app: FastAPI = request.app
    stats_data = await app.state.stats_service.get_stats()
    return make_response(
        status="success",
        request_id="stats",
        data=stats_data,
        confidence=1.0,
        processing_time_ms=0.0,
    )


@router.post("/config/update", dependencies=[Depends(validate_admin_token)])
async def update_config(request: Request, payload: ConfigUpdateRequest) -> dict[str, Any]:
    app: FastAPI = request.app
    updates = payload.model_dump(exclude_none=True)
    if "confidence_threshold" in updates:
        app.state.settings.confidence_threshold = updates["confidence_threshold"]
    if "engine_mode" in updates:
        app.state.settings.engine_mode = updates["engine_mode"]
        app.state.engine.mode = app.state.engine._detect_mode(updates["engine_mode"])
    if "batch_max_parallelism" in updates:
        app.state.settings.batch_max_parallelism = updates["batch_max_parallelism"]

    logger.warning("Config updated", extra={"extra_fields": {"updates": updates}})
    return make_response(
        status="success",
        request_id="config-update",
        data={"updated": updates},
        confidence=1.0,
        processing_time_ms=0.0,
    )
