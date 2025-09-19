

// src/app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      setErr("이메일과 비밀번호를 입력하세요.");
      setLoading(false);
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    try {
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include", // 서버가 설정하는 JWT 쿠키를 받기 위함
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || `로그인 실패 (${res.status})`);
      }

      // 로그인 성공 → 원하는 페이지로 이동
      router.replace("/harvest/empty-harvest");
    } catch (e: any) {
      setErr(e?.message || "요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-black">로그인</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[var(--color-pointer)] focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[var(--color-pointer)] focus:outline-none"
            required
          />

          {err && (
            <p className="text-sm text-red-600" role="alert">{err}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#4cbd06] px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-black">
          아직 계정이 없나요? <Link href="/signup" className="text-[#4cbd06] underline">회원가입</Link>
        </div>
      </div>
    </main>
  );
}