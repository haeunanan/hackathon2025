// src/app/api/quiz/route.ts
export const runtime = "nodejs";           // 엣지 말고 노드 런타임
export const dynamic = "force-dynamic";    // 캐시/정적화 방지

import type { NextRequest } from "next/server";

async function fetchWithTimeout(url: string, ms = 4000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ac.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: NextRequest) {
  const envBase = process.env.QUIZ_API_BASE;
  const { search } = new URL(req.url);

  const candidates = [
    envBase,                          // 우선 .env.local 값
    "http://127.0.0.1:8000",        // 기본
    "http://localhost:8000",        // 대체 (로컬호스트 해석 이슈 대비)
  ].filter(Boolean) as string[];

  const errors: string[] = [];

  for (const base of candidates) {
    const upstream = `${base}/quiz${search || ""}`;
    try {
      const r = await fetchWithTimeout(upstream, 4000);
      if (!r.ok) {
        const text = await r.text();
        errors.push(`[${base}] ${r.status} ${text.slice(0, 200)}`);
        continue;
      }
      const data = await r.json();
      return Response.json(data, { headers: { "cache-control": "no-store" } });
    } catch (e: any) {
      errors.push(`[${base}] fetch failed: ${e?.message || e}`);
      continue;
    }
  }

  // 모두 실패한 경우 상세 이유 반환
  const body = `quiz upstream failed:\n${errors.join("\n")}\n`;
  return new Response(body, {
    status: 502,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}