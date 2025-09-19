// src/app/api/quiz/route.ts
import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";

export const dynamic = "force-dynamic"; // 매 요청마다 실행

function runPython(scriptPath: string, args: string[] = []) {
  return new Promise<string>((resolve, reject) => {
    const py = spawn(process.env.PYTHON_PATH || "python3", [scriptPath, ...args], {
      cwd: process.cwd(),
    });

    let out = "";
    let err = "";

    py.stdout.on("data", (d) => (out += d.toString()));
    py.stderr.on("data", (d) => (err += d.toString()));
    py.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err || `Python exited with code ${code}`));
    });
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // m2w = 뜻→단어, w2m = 단어→뜻
    const type = url.searchParams.get("type") === "w2m" ? "w2m" : "m2w";
    // 엑셀 경로를 커스텀하고 싶으면 ?xlsx=/absolute/path.xlsx 로 전달 가능 (선택)
    const xlsx = url.searchParams.get("xlsx");

    const script = path.join(process.cwd(), "grower", "py", "make_question.py");
    const args = ["--type", type];
    if (xlsx) args.push("--xlsx", xlsx);

    const raw = await runPython(script, args);

    // 파이썬이 JSON을 출력한다고 가정
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // 혹시 파이썬이 디버그 문자열을 섞어 출력하면 대비
      return NextResponse.json(
        { error: "Invalid JSON from Python", raw },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}