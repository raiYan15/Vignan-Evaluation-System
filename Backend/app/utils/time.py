import time
from contextlib import contextmanager
from dataclasses import dataclass


@dataclass
class StageTimer:
    stages: dict[str, float]


@contextmanager
def stage(stages: dict[str, float], name: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        stages[name] = round((time.perf_counter() - start) * 1000, 2)
