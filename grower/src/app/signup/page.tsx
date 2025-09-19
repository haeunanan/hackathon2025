// src/app/signup/page.tsx
"use client";

import { FormEvent } from "react";

export default function SignupPage() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 여기에 회원가입 처리 로직을 추가하면 됩니다.
    alert("회원가입 폼이 제출되었습니다!");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="아이디"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-[var(--color-pointer)] focus:outline-none"
            required
          />
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
          <button
            type="submit"
            className="w-full rounded-md bg-[#4cbd06] px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600"
          >
            가입하기
          </button>
        </form>
      </div>
    </main>
  );
}