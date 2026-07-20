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

    return NextResponse.json({ downloadUrl: produto.download_url });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
