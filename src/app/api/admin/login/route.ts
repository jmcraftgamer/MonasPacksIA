import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: password });
    }

    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
