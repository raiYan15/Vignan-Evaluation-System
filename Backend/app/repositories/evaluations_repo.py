from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.repositories.mongo import MongoManager


class EvaluationsRepository:
    def __init__(self, mongo: MongoManager) -> None:
        self.mongo = mongo

    async def insert_evaluation(self, payload: dict[str, Any]) -> None:
        if (not self.mongo.available) or (self.mongo.db is None):
            return
        doc = {
            **payload,
            "timestamp": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await self.mongo.db["evaluations"].update_one(
            {"request_id": payload["request_id"]},
            {"$set": doc},
            upsert=True,
        )

    async def aggregate_stats(self) -> dict[str, Any]:
        if (not self.mongo.available) or (self.mongo.db is None):
            return {
                "total_evaluations": 0,
                "auto_graded_count": 0,
                "manual_review_count": 0,
                "avg_confidence": 0.0,
                "avg_processing_time": 0.0,
                "batch_jobs": 0,
            }

        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_evaluations": {"$sum": 1},
                    "manual_review_count": {
                        "$sum": {
                            "$cond": [{"$eq": ["$manual_review_flag", True]}, 1, 0],
                        },
                    },
                    "avg_confidence": {"$avg": "$confidence"},
                    "avg_processing_time": {"$avg": "$processing_time"},
                    "batch_jobs": {
                        "$sum": {
                            "$cond": [{"$ifNull": ["$batch_id", False]}, 1, 0],
                        },
                    },
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "total_evaluations": 1,
                    "manual_review_count": 1,
                    "auto_graded_count": {"$subtract": ["$total_evaluations", "$manual_review_count"]},
                    "avg_confidence": {"$ifNull": ["$avg_confidence", 0]},
                    "avg_processing_time": {"$ifNull": ["$avg_processing_time", 0]},
                    "batch_jobs": 1,
                }
            },
        ]
        result = await self.mongo.db["evaluations"].aggregate(pipeline).to_list(length=1)
        return result[0] if result else {
            "total_evaluations": 0,
            "auto_graded_count": 0,
            "manual_review_count": 0,
            "avg_confidence": 0.0,
            "avg_processing_time": 0.0,
            "batch_jobs": 0,
        }

    async def list_results(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        status: str | None = None,
        student_id: str | None = None,
    ) -> dict[str, Any]:
        if (not self.mongo.available) or (self.mongo.db is None):
            return {"items": [], "total": 0}

        query: dict[str, Any] = {}
        if student_id:
            query["student_id"] = student_id
        if status:
            query["status"] = status
        if search:
            query["$or"] = [
                {"request_id": {"$regex": search, "$options": "i"}},
                {"recognized_text": {"$regex": search, "$options": "i"}},
                {"student_id": {"$regex": search, "$options": "i"}},
            ]

        skip = (page - 1) * page_size
        projection = {"_id": 0}
        cursor = self.mongo.db["evaluations"].find(query, projection).sort("timestamp", -1).skip(skip).limit(page_size)
        items = await cursor.to_list(length=page_size)
        total = await self.mongo.db["evaluations"].count_documents(query)
        return {"items": items, "total": total}

    async def get_by_request_id(self, request_id: str) -> dict[str, Any] | None:
        if (not self.mongo.available) or (self.mongo.db is None):
            return None
        return await self.mongo.db["evaluations"].find_one({"request_id": request_id}, {"_id": 0})

    async def add_mis_evaluation_report(
        self,
        *,
        request_id: str,
        reporter_student_id: str,
        reason: str | None,
    ) -> bool:
        if (not self.mongo.available) or (self.mongo.db is None):
            return False

        now = datetime.now(timezone.utc)
        result = await self.mongo.db["evaluations"].update_one(
            {
                "request_id": request_id,
                "student_id": reporter_student_id,
            },
            {
                "$set": {
                    "manual_review_flag": True,
                    "status": "pending_review",
                    "mis_evaluation_reported": True,
                    "mis_evaluation_reason": (reason or "").strip() or None,
                    "mis_evaluation_reported_by": reporter_student_id,
                    "mis_evaluation_reported_at": now,
                    "updated_at": now,
                }
            },
        )
        return result.matched_count > 0

    async def get_class_result_summary(self, student_ids: list[str]) -> dict[str, Any]:
        if (not self.mongo.available) or (self.mongo.db is None) or not student_ids:
            return {"average": 0.0, "top_score": 0.0, "students": []}

        pipeline = [
            {"$match": {"student_id": {"$in": student_ids}}},
            {
                "$group": {
                    "_id": "$student_id",
                    "average_score": {"$avg": "$scores.final_marks"},
                    "evaluations": {"$sum": 1},
                    "avg_confidence": {"$avg": "$confidence"},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "student_id": "$_id",
                    "average_score": {"$round": [{"$ifNull": ["$average_score", 0]}, 2]},
                    "evaluations": 1,
                    "avg_confidence": {"$round": [{"$ifNull": ["$avg_confidence", 0]}, 4]},
                }
            },
            {"$sort": {"average_score": -1}},
        ]
        students = await self.mongo.db["evaluations"].aggregate(pipeline).to_list(length=5000)
        if not students:
            return {"average": 0.0, "top_score": 0.0, "students": []}

        class_avg = round(sum(float(s.get("average_score", 0.0)) for s in students) / len(students), 2)
        top_score = float(students[0].get("average_score", 0.0))
        for index, student in enumerate(students):
            student["rank"] = index + 1
        return {
            "average": class_avg,
            "top_score": top_score,
            "students": students,
        }
