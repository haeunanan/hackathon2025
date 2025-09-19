// src/app/quiz/page.tsx
import Link from "next/link";

export default function QuizIndexPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-col items-center space-y-6">
        <Link
          href="/quiz/easy"
          className="w-32 text-xl rounded-md bg-[#4cbd06] text-white py-3 font-semibold transition-colors hover:bg-green-600 text-center"
        >
          쉬움
        </Link>
        <Link
          href="/quiz/normal"
          className="w-32 text-xl rounded-md bg-[#4cbd06] text-white py-3 font-semibold transition-colors hover:bg-green-600 text-center"
        >
          보통
        </Link>
        <Link
          href="/quiz/difficult"
          className="w-32 text-xl rounded-md bg-[#4cbd06] text-white py-3 font-semibold transition-colors hover:bg-green-600 text-center"
        >
          어려움
        </Link>
      </div>
    </main>
  );
}
