from __future__ import annotations

import asyncio
import logging
import uuid
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.core.logging import configure_logging, request_id_ctx
from app.core.rate_limit import InMemoryRateLimiter
from app.core.state import AppState
from app.repositories.evaluations_repo import EvaluationsRepository
from app.repositories.mongo import MongoManager
from app.repositories.search_repo import SearchRepository
from app.repositories.users_repo import UsersRepository
from app.services.engine import EvaluationEngine
from app.services.file_service import FileService
from app.services.search_service import SearchService
from app.services.stats_service import StatsService

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    mongo = MongoManager(settings)
    await mongo.connect()

    engine = EvaluationEngine(settings)
    await engine.warmup()

    file_service = FileService(settings)
    runtime = AppState(ready=True)
    runtime.cleanup_task = asyncio.create_task(file_service.periodic_cleanup())

    app.state.settings = settings
    app.state.mongo = mongo
    app.state.engine = engine
    app.state.runtime = runtime
    app.state.rate_limiter = InMemoryRateLimiter(settings.rate_limit_window_seconds)
    app.state.file_service = file_service
    app.state.evaluations_repo = EvaluationsRepository(mongo)
    app.state.search_repo = SearchRepository(mongo)
    app.state.users_repo = UsersRepository(mongo)
    app.state.search_service = SearchService(settings)
    app.state.stats_service = StatsService(app.state.evaluations_repo, app.state.search_repo)

    logger.info("Application ready", extra={"extra_fields": {"engine_mode": engine.mode}})
    try:
        yield
    finally:
        runtime.ready = False
        if runtime.cleanup_task:
            runtime.cleanup_task.cancel()
            with suppress(asyncio.CancelledError):
                await runtime.cleanup_task
        await mongo.close()
        logger.info("Application shutdown complete")


app = FastAPI(title="VIGNAN Internal Evaluator Backend", version=get_settings().app_version, lifespan=lifespan)
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    token = request_id_ctx.set(request_id)
    try:
        response = await call_next(request)
    finally:
        request_id_ctx.reset(token)
    response.headers["x-request-id"] = request_id
    return response


app.include_router(router)
