from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING
from pymongo.errors import PyMongoError

from app.core.config import Settings

logger = logging.getLogger(__name__)


class MongoManager:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None
        self.available: bool = False

    async def connect(self) -> None:
        if not self.settings.mongo_enabled:
            self.available = False
            logger.info("Mongo disabled by configuration; running in offline mode")
            return

        try:
            self.client = AsyncIOMotorClient(
                self.settings.mongo_uri,
                maxPoolSize=self.settings.mongo_max_pool_size,
                minPoolSize=self.settings.mongo_min_pool_size,
                connectTimeoutMS=self.settings.mongo_connect_timeout_ms,
                serverSelectionTimeoutMS=self.settings.mongo_server_selection_timeout_ms,
                retryWrites=True,
            )
            await self.client.admin.command("ping")
            self.db = self.client[self.settings.mongo_db]
            await self._ensure_indexes()
            self.available = True
            logger.info("Mongo connected", extra={"extra_fields": {"mongo_db": self.settings.mongo_db}})
        except Exception as exc:  # noqa: BLE001
            self.available = False
            logger.error(
                "Mongo unavailable; continuing in degraded mode",
                extra={"extra_fields": {"error": str(exc)}},
            )

    async def _ensure_indexes(self) -> None:
        if self.db is None:
            return
        evaluations = self.db["evaluations"]
        users = self.db["users"]
        batch_jobs = self.db["batch_jobs"]
        search_history = self.db["search_history"]

        await evaluations.create_index([("request_id", ASCENDING)], unique=True, name="idx_request_id_unique")
        await evaluations.create_index([("timestamp", ASCENDING)], name="idx_timestamp")
        await evaluations.create_index([("status", ASCENDING)], name="idx_status")
        await evaluations.create_index([("confidence", ASCENDING)], name="idx_confidence")
        await evaluations.create_index([("student_id", ASCENDING)], sparse=True, name="idx_student_sparse")
        await evaluations.create_index([("batch_id", ASCENDING)], sparse=True, name="idx_batch_id_sparse")

        await users.create_index([("email", ASCENDING)], unique=True, name="idx_users_email_unique")
        await users.create_index([("role", ASCENDING)], name="idx_users_role")
        await users.create_index([("roll_number", ASCENDING)], sparse=True, name="idx_users_roll_number")

        await batch_jobs.create_index([("request_id", ASCENDING)], unique=True, name="idx_batch_request_id_unique")
        await batch_jobs.create_index([("timestamp", ASCENDING)], name="idx_batch_timestamp")
        await batch_jobs.create_index([("created_by", ASCENDING)], name="idx_batch_created_by")

        await search_history.create_index([("timestamp", ASCENDING)], name="idx_search_timestamp")

    async def ping(self) -> bool:
        if self.client is None:
            return False
        try:
            await self.client.admin.command("ping")
            self.available = True
            return True
        except PyMongoError:
            self.available = False
            return False

    async def close(self) -> None:
        if self.client is not None:
            self.client.close()
        self.available = False
