import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const { data: produto } = await supabaseAdmin.from("produtos").select("*").eq("id", id).single();
    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const url = produto.download_url?.trim();
    if (!url) {
      return NextResponse.json({ error: "URL de download não disponível" }, { status: 400 });
    }

    const origemRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
      },
    });

    if (!origemRes.ok) {
      return NextResponse.json({ error: `Falha ao baixar: HTTP ${origemRes.status}` }, { status: 502 });
    }

    const contentType = origemRes.headers.get("content-type") || "application/octet-stream";
    const fileName = encodeURIComponent(produto.nome || "arquivo");

    return new NextResponse(origemRes.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Erro interno: ${error.message}` }, { status: 500 });
  }
}