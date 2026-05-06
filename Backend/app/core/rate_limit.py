import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    def __init__(self, window_seconds: int) -> None:
        self.window_seconds = window_seconds
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def _prune(self, key: str, now: float) -> None:
        q = self.hits[key]
        while q and now - q[0] > self.window_seconds:
            q.popleft()

    async def check(self, request: Request, key_suffix: str, max_requests: int) -> None:
        ip = request.client.host if request.client else "unknown"
        key = f"{ip}:{key_suffix}"
        now = time.time()
        self._prune(key, now)
        if len(self.hits[key]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Try again later.",
            )
        self.hits[key].append(now)
