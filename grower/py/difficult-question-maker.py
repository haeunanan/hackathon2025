# -*- coding: utf-8 -*-
"""
On-demand Quiz API (FastAPI)

- Reads CSV `difficult-word.csv` (same dir) where:
  A: key (word), B: value (meaning)
- Serves fresh randomized quizzes on each request
- Two types:
  1) meaning_to_word (뜻 → 단어 고르기)
  2) word_to_meaning (단어 → 뜻 고르기)

Run (macOS / Windows):
    pip install fastapi uvicorn pandas
    python difficult-question-maker.py

Test:
    curl "http://127.0.0.1:8000/quiz?num=10&ratio=0.5&seed=42" | jq

Integrate in Next.js route.ts:
    await fetch("http://127.0.0.1:8000/quiz?num=10&ratio=0.5")
"""

from __future__ import annotations

import random
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

Pair = Tuple[str, str]  # (word, meaning)

app = FastAPI(title="Difficult Word Quiz API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load data once at startup
# -----------------------------

def load_pairs_from_csv(csv_name: str = "difficult-word.csv") -> List[Pair]:
    here = Path(__file__).resolve().parent
    csv_path = here / csv_name
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    # If CSV has headers, we still take first two columns
    df = pd.read_csv(csv_path, header=None)
    if df.shape[1] < 2:
        raise ValueError("CSV must have at least two columns: A=key(word), B=value(meaning)")

    sub = df.iloc[:, :2].copy()
    sub.columns = ["key", "value"]
    sub["key"] = sub["key"].astype(str).str.strip()
    sub["value"] = sub["value"].astype(str).str.strip()
    sub = sub.replace({"": None, "nan": None})
    sub = sub.dropna(subset=["key", "value"]).drop_duplicates()

    pairs: List[Pair] = [(w, m) for w, m in sub.itertuples(index=False, name=None)]
    if len(pairs) < 4:
        raise ValueError("At least 4 rows required to build 4-choice questions.")
    return pairs

try:
    PAIRS: List[Pair] = load_pairs_from_csv()
except Exception as e:
    # If load fails at import-time, raise clear message
    raise RuntimeError(f"Failed to load CSV: {e}")

# -----------------------------
# Quiz builders
# -----------------------------

def _pick_distractors(pool: List[Pair], correct_idx: int, count: int, pick_meaning: bool) -> List[str]:
    result: List[str] = []
    used_idx = {correct_idx}
    used_vals = set()

    while len(result) < count:
        i = random.randrange(0, len(pool))
        if i in used_idx:
            continue
        val = pool[i][1] if pick_meaning else pool[i][0]
        if val in used_vals:
            continue
        result.append(val)
        used_vals.add(val)
        used_idx.add(i)
        if len(used_idx) >= len(pool):
            break

    if len(result) < count:
        for j, (w, m) in enumerate(pool):
            if j in used_idx:
                continue
            val = m if pick_meaning else w
            if val not in used_vals:
                result.append(val)
                used_vals.add(val)
            if len(result) == count:
                break

    if len(result) < count:
        raise ValueError("Not enough unique distractors. Add more distinct rows to CSV.")
    return result


def build_q_meaning_to_word(pool: List[Pair], idx: int) -> Dict:
    word, meaning = pool[idx]
    distractors = _pick_distractors(pool, idx, 3, pick_meaning=False)
    options = distractors + [word]
    random.shuffle(options)
    return {
        "type": "meaning_to_word",
        "question": meaning,
        "options": options,
        "answer": word,
    }


def build_q_word_to_meaning(pool: List[Pair], idx: int) -> Dict:
    word, meaning = pool[idx]
    distractors = _pick_distractors(pool, idx, 3, pick_meaning=True)
    options = distractors + [meaning]
    random.shuffle(options)
    return {
        "type": "word_to_meaning",
        "question": word,
        "options": options,
        "answer": meaning,
    }


def generate_quiz(pool: List[Pair], n: int, ratio_type1: float) -> Dict:
    if n <= 0:
        n = 1
    n_type1 = int(round(n * ratio_type1))
    n_type2 = n - n_type1

    idx_all = list(range(len(pool)))
    random.shuffle(idx_all)

    # sample with replacement if needed
    pick1 = (idx_all[:n_type1] if n_type1 <= len(pool) else [random.choice(idx_all) for _ in range(n_type1)])
    pick2 = (idx_all[n_type1:n_type1+n_type2] if n_type2 <= len(pool) else [random.choice(idx_all) for _ in range(n_type2)])

    items: List[Dict] = []
    for i in pick1:
        items.append(build_q_meaning_to_word(pool, i))
    for i in pick2:
        items.append(build_q_word_to_meaning(pool, i))

    random.shuffle(items)
    return {
        "quiz_title": "어려운 단어 퀴즈",
        "count": len(items),
        "questions": items,
    }

# -----------------------------
# API endpoints
# -----------------------------

@app.get("/health")
async def health():
    return {"ok": True, "items": len(PAIRS)}


@app.get("/quiz")
async def quiz(
    num: int = Query(10, ge=1, description="총 문항 수"),
    ratio: float = Query(0.5, ge=0.0, le=1.0, description="type1(뜻→단어) 비율"),
    seed: int | None = Query(None, description="랜덤 시드 (고정 재현용)")
):
    try:
        if seed is not None:
            random.seed(seed)
        q = generate_quiz(PAIRS, n=num, ratio_type1=ratio)
        return q
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"server error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("difficult-question-maker:app", host="127.0.0.1", port=8000, reload=False)