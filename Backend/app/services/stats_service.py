from __future__ import annotations

from app.repositories.evaluations_repo import EvaluationsRepository
from app.repositories.search_repo import SearchRepository


class StatsService:
    def __init__(self, evaluations_repo: EvaluationsRepository, search_repo: SearchRepository) -> None:
        self.evaluations_repo = evaluations_repo
        self.search_repo = search_repo

    async def get_stats(self) -> dict:
        evaluation_stats = await self.evaluations_repo.aggregate_stats()
        search_count = await self.search_repo.count()
        return {
            **evaluation_stats,
            "search_count": search_count,
        }
