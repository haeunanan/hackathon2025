

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    fetch(`${base}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
      .finally(() => {
        router.push("/");
      });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>로그아웃 중...</p>
    </main>
  );
}