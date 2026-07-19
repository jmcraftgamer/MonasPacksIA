import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const { data: produto, error } = await supabaseAdmin.from("produtos").select("*").eq("id", id).single();

  if (error || !produto) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  return NextResponse.json(produto);
}
