from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.repositories.mongo import MongoManager


class UsersRepository:
    def __init__(self, mongo: MongoManager) -> None:
        self.mongo = mongo

    async def insert_user(self, payload: dict[str, Any]) -> bool:
        if (not self.mongo.available) or (self.mongo.db is None):
            return False
        now = datetime.now(timezone.utc)
        doc = {
            **payload,
            "created_at": now,
            "updated_at": now,
        }
        await self.mongo.db["users"].update_one(
            {"email": payload["email"]},
            {"$set": doc},
            upsert=True,
        )
        return True

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        if (not self.mongo.available) or (self.mongo.db is None):
            return None
        return await self.mongo.db["users"].find_one({"email": email})

    async def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        if (not self.mongo.available) or (self.mongo.db is None):
            return None
        return await self.mongo.db["users"].find_one({"user_id": user_id})

    async def list_students_by_branch_section(self, branch: str, section: str) -> list[dict[str, Any]]:
        if (not self.mongo.available) or (self.mongo.db is None):
            return []
        cursor = self.mongo.db["users"].find(
            {
                "role": "student",
                "branch": branch,
                "section": section,
            },
            {"_id": 0},
        )
        return await cursor.to_list(length=5000)
