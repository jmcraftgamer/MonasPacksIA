import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });

    const origemRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/webp,image/png,image/gif,image/jpeg,*/*",
      },
    });

    if (!origemRes.ok) return NextResponse.json({ error: "Erro ao buscar imagem" }, { status: 502 });

    return new Response(origemRes.body, {
      headers: {
        "Content-Type": origemRes.headers.get("content-type") || "image/webp",
        "Cache-Control": "public, s-maxage=31536000, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}