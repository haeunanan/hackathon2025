"use client";

export default function QuizPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] relative">
      <div className="absolute top-4 left-4 text-xl font-semibold">
        내 페이지 : nn코인
      </div>
    </main>
  );
}

import { useMemo, useState } from "react";

type ItemKey = "grape" | "strawberry" | "mango" | "apple";

type Item = {
  key: ItemKey;
  name: string;
  emoji: string; // 이미지 대체 (원하면 public/ 아래로 교체 가능)
};

const ITEMS: Item[] = [
  { key: "grape", name: "포도 씨앗", emoji: "🍇" },
  { key: "strawberry", name: "딸기 씨앗", emoji: "🍓" },
  { key: "mango", name: "망고 씨앗", emoji: "🥭" },
  { key: "apple", name: "사과 씨앗", emoji: "🍎" },
];

export default function StorePage() {
  // 개수 상태
  const [counts, setCounts] = useState<Record<ItemKey, number>>({
    grape: 0,
    strawberry: 0,
    mango: 0,
    apple: 0,
  });

  // TODO: 지갑 연동 시 실제 코인 잔액으로 교체
  const myCoins = "n"; // 예: 120

  const total = useMemo(() =>
    Object.values(counts).reduce((a, b) => a + b, 0)
  , [counts]);

  const inc = (k: ItemKey) => setCounts((p) => ({ ...p, [k]: Math.min(999, (p[k] ?? 0) + 1) }));
  const dec = (k: ItemKey) => setCounts((p) => ({ ...p, [k]: Math.max(0, (p[k] ?? 0) - 1) }));

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* 상단 코인 표시 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-2xl font-semibold">내 코인: <span className="align-middle">{myCoins}</span>개</div>
      </div>

      {/* 상품 카드 그리드 */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {ITEMS.map((item) => (
            <article key={item.key} className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-xl shadow-sm border border-black/10 dark:border-white/10 p-6 flex flex-col items-center">
              <div className="text-7xl select-none" aria-hidden>{item.emoji}</div>
              <h3 className="mt-4 text-lg font-semibold">{item.name}</h3>

              {/* 수량 컨트롤 */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`${item.name} 감소`}
                  onClick={() => dec(item.key)}
                  className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-40"
                  disabled={counts[item.key] === 0}
                >
                  ◀
                </button>
                <div className="min-w-10 text-center font-semibold text-lg">{counts[item.key] ?? 0}</div>
                <button
                  type="button"
                  aria-label={`${item.name} 증가`}
                  onClick={() => inc(item.key)}
                  className="px-4 py-2 rounded-md bg-green-600 text-white"
                >
                  ▶
                </button>
              </div>
            </article>
          ))}

          {/* 입고 예정 카드 */}
          <article className="bg-white/50 dark:bg-white/5 backdrop-blur rounded-xl shadow-sm border border-dashed border-black/20 dark:border-white/20 p-6 flex flex-col items-center justify-center">
            <div className="text-6xl">💬</div>
            <div className="mt-4 text-lg font-semibold">입고 예정 …</div>
          </article>
        </div>
      </section>

      {/* 요약 + 구매 버튼 */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="space-y-1 text-lg">
          <div>포도 씨앗 {counts.grape} 개</div>
          <div>딸기 씨앗 {counts.strawberry} 개</div>
          <div>망고 씨앗 {counts.mango} 개</div>
          <div>사과 씨앗 {counts.apple} 개</div>
        </div>

        <button
          type="button"
          className={`mt-8 w-full sm:w-auto px-6 py-4 rounded-xl text-white font-semibold ${total > 0 ? "bg-green-600 hover:brightness-95" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={total === 0}
          onClick={() => alert(`총 ${total}개 구매하시겠습니까?`)}
        >
          총 {total === 0 ? "n" : total} 개 구매하시겠습니까?
        </button>
      </section>
    </main>
  );
}