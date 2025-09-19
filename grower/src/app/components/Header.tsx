import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-100 shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <img src="/grower.png" alt="Grower logo" className="h-8 w-auto mr-6" />
        <nav className="flex items-center space-x-12 ml-8">
          <Link href="/" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">홈</Link>
          <Link href="/quiz" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">퀴즈</Link>
          <Link href="/store" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">상점</Link>
          <Link href="/harvest" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">재배</Link>
          <Link href="/player-scores" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">점수</Link>
          <Link href="/signup" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">로그인</Link>
        </nav>
      </div>
      <Link href="/settings" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">
        마이 페이지
      </Link>
    </header>
  );
}