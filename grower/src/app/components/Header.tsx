"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    const check = async () => {
      try {
        const res = await fetch(`${base}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!alive) return;
        setIsLoggedIn(res.ok);
      } catch {
        if (!alive) return;
        setIsLoggedIn(false);
      }
    };

    // initial & when route changes
    check();

    // when tab gains focus (user might have logged out in another tab)
    const onFocus = () => check();
    const onVisibility = () => { if (document.visibilityState === "visible") check(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

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
          {isLoggedIn ? (
            <Link href="/logout" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">로그아웃</Link>
          ) : (
            <Link href="/login" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">로그인</Link>
          )}
        </nav>
      </div>
      <Link href="/settings" className="text-base font-medium text-[var(--foreground)] transition-colors hover:text-[var(--color-pointer)]">
        마이 페이지
      </Link>
    </header>
  );
}