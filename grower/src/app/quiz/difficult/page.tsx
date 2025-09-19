// src/app/quiz/difficult/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QuizItem = {
  type: "meaning_to_word" | "word_to_meaning";
  question: string;
  options: string[];
  answer: string;
};

type QuizResponse = {
  quiz_title: string;
  count: number;
  questions: QuizItem[];
};

export default function DifficultQuizPage() {
  const router = useRouter();
  const [data, setData] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch("/api/quiz?num=10&ratio=0.5", { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text());
      const json = (await r.json()) as QuizResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "failed to load quiz");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function pick(qIdx: number, opt: string) {
    setSel((prev) => ({ ...prev, [qIdx]: opt }));
  }

  function onSubmit() {
    if (!data) return;
    const correct = data.questions.reduce((acc, q, i) => acc + (sel[i] === q.answer ? 1 : 0), 0);
    const total = data.questions.length;
    router.push(`/quiz/difficult/score?correct=${correct}&total=${total}`);
  }

  if (loading) return <main className="min-h-screen p-6">불러오는 중…</main>;
  if (error) return <main className="min-h-screen p-6 text-red-600">에러: {error}</main>;
  if (!data) return <main className="min-h-screen p-6">데이터 없음</main>;

  const allAnswered = Object.keys(sel).length === data.questions.length;

  return (
    <main className="min-h-screen p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {data.quiz_title} ({data.count}문항)
        </h1>
        <button
          onClick={load}
          className="border rounded px-3 py-1 text-sm"
          title="문제 새로고침"
        >
          새로고침
        </button>
      </div>

      <ol className="space-y-6 list-decimal pl-5">
        {data.questions.map((q, idx) => (
          <li key={idx} className="space-y-2">
            <div>
              <span className="mr-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                {q.type === "meaning_to_word" ? "뜻→단어" : "단어→뜻"}
              </span>
              <span className="font-semibold">{q.question}</span>
            </div>
            <ul className="space-y-2">
              {q.options.map((opt, i) => {
                const id = `q${idx}-opt${i}`;
                return (
                  <li key={i} className={`border rounded px-3 py-2 transition-colors ${sel[idx] === opt ? "border-blue-500" : "border-gray-300"}`}>
                    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        id={id}
                        type="radio"
                        name={`q-${idx}`}
                        value={opt}
                        checked={sel[idx] === opt}
                        onChange={() => pick(idx, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={`px-4 py-2 rounded text-white ${allAnswered ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          제출하기
        </button>
      </div>
    </main>
  );
}