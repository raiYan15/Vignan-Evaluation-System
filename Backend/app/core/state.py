import asyncio
from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class AppState:
    ready: bool = False
    queue_depth: int = 0
    latency_samples: list[float] = field(default_factory=list)
    cleanup_task: asyncio.Task | None = None
    batch_connections: dict[str, list[Any]] = field(default_factory=dict)

    def record_latency(self, latency_ms: float) -> None:
        self.latency_samples.append(latency_ms)
        if len(self.latency_samples) > 500:
            self.latency_samples = self.latency_samples[-500:]

    @property
    def avg_latency(self) -> float:
        if not self.latency_samples:
            return 0.0
        return round(sum(self.latency_samples) / len(self.latency_samples), 2)
