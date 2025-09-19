// src/app/harvest/empty-harvest/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HarvestPage() {
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const saved = Number(localStorage.getItem("quiz_total_score") ?? 0);
    setTotalScore(saved);
  }, []);

  return (
    <main className="h-screen flex flex-col justify-end overflow-hidden bg-[var(--background)] text-[var(--foreground)] relative">
      {/* 누적 총점 표시 */}
      <div className="absolute top-4 left-4 text-xl font-semibold">
        내 총점: {totalScore}
      </div>

      {/* 중앙 안내 문구 */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">
        아무것도 심기지 않았습니다. 심을 씨앗을 골라주세요!
      </div>

      {/* 우상단 박스 링크 */}
      <div className="absolute top-4 right-4">
        <Link href="/harvest/empty-harvest/box">
          <Image
            src="/box.png"
            alt="box"
            width={300}
            height={300}
          />
        </Link>
      </div>

      {/* 하단 배경 이미지 */}
      <div className="w-full flex justify-center">
        <Image
          src="/Ellipse 2.png"
          alt="ellipse decoration"
          width={800}
          height={200}
          style={{ objectFit: "cover", width: "90vw", height: "auto" }}
        />
      </div>
    </main>
  );
}