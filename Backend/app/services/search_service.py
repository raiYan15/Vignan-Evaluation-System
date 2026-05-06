from __future__ import annotations

import asyncio
import json
import re
import time
from collections.abc import Awaitable, Callable
from typing import Any

from cachetools import TTLCache
import httpx

from app.core.config import Settings


class SearchService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.cache: TTLCache[str, list[dict]] = TTLCache(maxsize=1000, ttl=settings.search_cache_ttl_seconds)
        self.failures = 0
        self.open_until = 0.0

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.settings.gemini_api_key.strip())

    def _breaker_open(self) -> bool:
        return time.time() < self.open_until

    def _register_failure(self) -> None:
        self.failures += 1
        if self.failures >= self.settings.search_circuit_breaker_fail_threshold:
            self.open_until = time.time() + self.settings.search_circuit_breaker_reset_seconds

    def _register_success(self) -> None:
        self.failures = 0
        self.open_until = 0.0

    @staticmethod
    def _extract_json_block(text: str) -> str | None:
        stripped = text.strip()
        if stripped.startswith("[") or stripped.startswith("{"):
            return stripped

        match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
        if match:
            return match.group(1).strip()
        return None

    async def _call_gemini(self, prompt: str) -> str | None:
        if not self.gemini_enabled:
            return None

        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.settings.gemini_model}:generateContent?key={self.settings.gemini_api_key}"
        )
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": self.settings.gemini_temperature,
                "maxOutputTokens": self.settings.gemini_max_output_tokens,
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ],
        }

        timeout = max(1.0, self.settings.search_timeout_ms / 1000)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(endpoint, json=payload)
                response.raise_for_status()
                data = response.json()
                candidates = data.get("candidates") or []
                if not candidates:
                    return None
                parts = candidates[0].get("content", {}).get("parts", [])
                text_parts = [p.get("text", "") for p in parts if isinstance(p, dict)]
                merged = "\n".join(part for part in text_parts if part)
                return merged or None
        except Exception:  # noqa: BLE001
            return None

    async def ai_search_answers(self, query: str, sources: list[str] | None = None) -> list[dict[str, Any]]:
        sources = sources or []
        source_hint = "\n".join(f"- {s}" for s in sources[:10]) if sources else "None provided"
        prompt = (
            "You are a concise academic assistant.\n"
            "Return ONLY valid JSON with no markdown fences.\n"
            "Output must be a JSON array of up to 5 objects with keys exactly:\n"
            "title (string), snippet (string), url (string), relevance (number 0 to 1).\n"
            f"Query: {query}\n"
            f"Preferred sources (if any):\n{source_hint}\n"
            "Make snippets short and factual."
        )

        raw = await self._call_gemini(prompt)
        if not raw:
            return self._fallback(query)

        block = self._extract_json_block(raw)
        if not block:
            return self._fallback(query)

        try:
            parsed = json.loads(block)
            if not isinstance(parsed, list):
                return self._fallback(query)

            cleaned: list[dict[str, Any]] = []
            for item in parsed[:5]:
                if not isinstance(item, dict):
                    continue
                title = str(item.get("title", "")).strip()
                snippet = str(item.get("snippet", "")).strip()
                url = str(item.get("url", "")).strip()
                relevance_raw = item.get("relevance", 0.5)
                try:
                    relevance = float(relevance_raw)
                except Exception:  # noqa: BLE001
                    relevance = 0.5
                relevance = min(1.0, max(0.0, relevance))
                if not title or not snippet:
                    continue
                cleaned.append(
                    {
                        "title": title,
                        "snippet": snippet,
                        "url": url,
                        "relevance": relevance,
                    }
                )

            return cleaned or self._fallback(query)
        except Exception:  # noqa: BLE001
            return self._fallback(query)

    async def ai_compare_answer(self, student_answer: str, reference_answers: list[str]) -> dict[str, Any]:
        refs = reference_answers or []
        if not refs:
            return self._fallback_compare(student_answer, refs)

        refs_blob = "\n\n".join(f"Reference {idx + 1}: {ref}" for idx, ref in enumerate(refs[:8]))
        prompt = (
            "Compare a student answer with references.\n"
            "Return ONLY valid JSON object (no markdown), with keys exactly:\n"
            "similarities (array of {source:string, score:number 0..1}),\n"
            "average_similarity (number 0..1),\n"
            "matching_concepts (array of strings, max 12).\n"
            f"Student answer:\n{student_answer}\n\n"
            f"References:\n{refs_blob}"
        )

        raw = await self._call_gemini(prompt)
        if not raw:
            return self._fallback_compare(student_answer, refs)

        block = self._extract_json_block(raw)
        if not block:
            return self._fallback_compare(student_answer, refs)

        try:
            parsed = json.loads(block)
            if not isinstance(parsed, dict):
                return self._fallback_compare(student_answer, refs)

            similarities_raw = parsed.get("similarities", [])
            similarities: list[dict[str, Any]] = []
            if isinstance(similarities_raw, list):
                for item in similarities_raw[: len(refs)]:
                    if not isinstance(item, dict):
                        continue
                    source = str(item.get("source", "")).strip() or "reference"
                    try:
                        score = float(item.get("score", 0.0))
                    except Exception:  # noqa: BLE001
                        score = 0.0
                    similarities.append({"source": source, "score": min(1.0, max(0.0, score))})

            if not similarities:
                return self._fallback_compare(student_answer, refs)

            avg = float(parsed.get("average_similarity", 0.0))
            avg = min(1.0, max(0.0, avg))

            concepts_raw = parsed.get("matching_concepts", [])
            concepts: list[str] = []
            if isinstance(concepts_raw, list):
                concepts = [str(c).strip() for c in concepts_raw if str(c).strip()][:12]

            return {
                "student_text": student_answer,
                "similarities": similarities,
                "average_similarity": avg if avg > 0 else round(sum(s["score"] for s in similarities) / len(similarities), 4),
                "matching_concepts": concepts,
            }
        except Exception:  # noqa: BLE001
            return self._fallback_compare(student_answer, refs)

    @staticmethod
    def _fallback_compare(student_answer: str, reference_answers: list[str]) -> dict[str, Any]:
        similarities = [
            {
                "source": ref[:40],
                "score": min(1.0, max(0.1, len(set(student_answer.split()) & set(ref.split())) / 20)),
            }
            for ref in reference_answers
        ]
        avg = round(sum(item["score"] for item in similarities) / len(similarities), 4) if similarities else 0.0
        concepts = list({token.lower() for token in student_answer.split() if len(token) > 4})[:8]
        return {
            "student_text": student_answer,
            "similarities": similarities,
            "average_similarity": avg,
            "matching_concepts": concepts,
        }

    async def search_answers(
        self,
        query: str,
        provider: Callable[[str], Awaitable[list[dict]]],
    ) -> list[dict]:
        if query in self.cache:
            return self.cache[query]

        if self._breaker_open():
            return self._fallback(query)

        try:
            results = await asyncio.wait_for(provider(query), timeout=self.settings.search_timeout_ms / 1000)
            self.cache[query] = results
            self._register_success()
            return results
        except Exception:  # noqa: BLE001
            self._register_failure()
            return self._fallback(query)

    def _fallback(self, query: str) -> list[dict]:
        return [
            {
                "title": "Fallback Knowledge",
                "snippet": f"No live source available; fallback for query: {query}",
                "url": "internal://fallback",
                "relevance": 0.35,
            }
        ]
