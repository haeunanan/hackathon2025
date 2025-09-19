#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random
import pandas as pd
import os

def load_vocab(xlsx_path: str) -> dict[str, str]:
    """
    엑셀 파일에서 단어-뜻 데이터를 읽어 딕셔너리로 반환.
    A열 = key(단어), B열 = value(뜻)
    """
    df = pd.read_excel(xlsx_path, header=None)
    # 공백 제거 후 key:value 매핑
    vocab = {str(row[0]).strip(): str(row[1]).strip() for _, row in df.iterrows()}
    return vocab

def main():
    # 엑셀 파일 경로 (프로젝트 위치에 맞게 수정)
    xlsx_path = os.path.join(os.path.dirname(__file__), "어휘.xlsx")

    vocab = load_vocab(xlsx_path)

    # 문제 1개 랜덤 선택
    word, meaning = random.choice(list(vocab.items()))

    result = {
        "question": f"다음 뜻에 맞는 단어는? → {meaning}",
        "answer": word,
        "total_count": len(vocab)
    }

    # JSON 출력
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random
import pandas as pd
import os
import argparse
from typing import Dict, Tuple, List


def load_vocab(xlsx_path: str) -> Dict[str, str]:
  """
  엑셀 파일에서 단어-뜻 데이터를 읽어 딕셔너리로 반환.
  A열 = key(단어), B열 = value(뜻)
  """
  df = pd.read_excel(xlsx_path, header=None)
  # 공백 제거 + 결측치 제거
  pairs = []
  for _, row in df.iterrows():
    k = str(row[0]).strip() if pd.notna(row[0]) else ""
    v = str(row[1]).strip() if pd.notna(row[1]) else ""
    if k and v:
      pairs.append((k, v))
  return dict(pairs)


def _sample_distractors(pool: List[str], correct: str, k: int = 3) -> List[str]:
  """정답을 제외한 보기 k개 샘플링(중복 없이). 풀 크기가 작으면 가능한 만큼만."""
  candidates = [x for x in pool if x != correct]
  k = min(k, len(candidates))
  return random.sample(candidates, k) if k > 0 else []


def make_mcq_meaning_to_word(vocab: Dict[str, str]) -> Dict:
  """
  (1) 뜻 → 단어 (사지선다)
  prompt: "다음 뜻에 맞는 단어는? → {뜻}"
  choices: [단어, ...] 4개
  """
  if len(vocab) < 2:
    return {"error": "보기 생성을 위한 데이터가 부족합니다(최소 2개)."}

  items: List[Tuple[str, str]] = list(vocab.items())
  word, meaning = random.choice(items)

  # 보기는 '단어' 풀에서 뽑는다
  distractors = _sample_distractors([w for w, _ in items], word, k=3)
  choices = [word] + distractors
  random.shuffle(choices)
  correct_index = choices.index(word)

  return {
    "type": "meaning_to_word",
    "prompt": f"다음 뜻에 맞는 단어는? → {meaning}",
    "choices": choices,
    "correct_index": correct_index,
    "answer": word,
    "total_count": len(items),
  }


def make_mcq_word_to_meaning(vocab: Dict[str, str]) -> Dict:
  """
  (2) 단어 → 뜻 (사지선다)
  prompt: "다음 단어의 뜻은? → {단어}"
  choices: [뜻, ...] 4개
  """
  if len(vocab) < 2:
    return {"error": "보기 생성을 위한 데이터가 부족합니다(최소 2개)."}

  items: List[Tuple[str, str]] = list(vocab.items())
  word, meaning = random.choice(items)

  # 보기는 '뜻' 풀에서 뽑는다
  distractors = _sample_distractors([m for _, m in items], meaning, k=3)
  choices = [meaning] + distractors
  random.shuffle(choices)
  correct_index = choices.index(meaning)

  return {
    "type": "word_to_meaning",
    "prompt": f"다음 단어의 뜻은? → {word}",
    "choices": choices,
    "correct_index": correct_index,
    "answer": meaning,
    "total_count": len(items),
  }


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--xlsx", default=os.path.join(os.path.dirname(__file__), "어휘.xlsx"))
  parser.add_argument("--type", choices=["m2w", "w2m"], default="m2w",
                      help="문항 유형: m2w=뜻→단어, w2m=단어→뜻")
  args = parser.parse_args()

  vocab = load_vocab(args.xlsx)

  if args.type == "m2w":
    result = make_mcq_meaning_to_word(vocab)
  else:
    result = make_mcq_word_to_meaning(vocab)

  print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
  main()