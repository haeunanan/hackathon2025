import { headers } from "next/headers";

type Question = {
  prompt: string;
  choices: string[];
  correct_index: number;
  answer: string;
  type: "meaning_to_word" | "word_to_meaning";
  total_count: number;
};

async function getQuestion(type: "m2w" | "w2m" = "m2w") {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;
  const res = await fetch(`${base}/api/quiz/easy?type=${type}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("API error");
  return res.json() as Promise<Question>;
}

export default async function EasyQuizPage() {
  const data = await getQuestion("m2w"); // easy에선 일단 뜻→단어 예시
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-xl rounded-md bg-white p-8 shadow">
        <div className="mb-4 text-sm font-medium text-gray-500">
          유형: {data.type === "meaning_to_word" ? "뜻→단어" : "단어→뜻"}
        </div>
        <h1 className="mb-6 text-xl font-bold text-black">{data.prompt}</h1>
        <ul className="space-y-3">
          {data.choices.map((c, i) => (
            <li key={i}>
              <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-left hover:border-[var(--color-pointer)] hover:text-[var(--color-pointer)] transition-colors">
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}