from __future__ import annotations

from datetime import datetime, timezone

from app.repositories.mongo import MongoManager


class SearchRepository:
    def __init__(self, mongo: MongoManager) -> None:
        self.mongo = mongo

    async def log_search(self, query: str, results_count: int, latency_ms: float) -> None:
        if (not self.mongo.available) or (self.mongo.db is None):
            return
        await self.mongo.db["search_history"].insert_one(
            {
                "query": query,
                "results_count": results_count,
                "latency_ms": latency_ms,
                "timestamp": datetime.now(timezone.utc),
            }
        )

    async def count(self) -> int:
        if (not self.mongo.available) or (self.mongo.db is None):
            return 0
        return await self.mongo.db["search_history"].count_documents({})
