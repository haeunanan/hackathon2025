"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ScorePage() {
  const params = useSearchParams();
  const correct = Number(params.get("correct") ?? 0);
  const total = Number(params.get("total") ?? 0);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // 점수를 localStorage에 누적 저장
  useEffect(() => {
    if (total > 0) {
      const prev = Number(localStorage.getItem("quiz_total_score") ?? 0);
      localStorage.setItem("quiz_total_score", String(prev + correct));
    }
  }, [correct, total]);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">결과</h1>
      <div className="text-xl">
        점수: <span className="font-semibold">{correct}</span> / {total} ({pct}%)
      </div>
      <div className="flex gap-3">
        <Link
          href="/quiz/difficult"
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          다시 풀기
        </Link>
        <Link
          href="/"
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}