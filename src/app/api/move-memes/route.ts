import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: items, error: selectErr } = await supabaseAdmin
    .from("produtos")
    .select("id")
    .eq("categoria", "memes-imagem");

  if (selectErr) {
    return NextResponse.json({ error: selectErr.message }, { status: 500 });
  }

  const total = items?.length || 0;

  const { error: updateErr } = await supabaseAdmin
    .from("produtos")
    .update({ categoria: "memes-video", subcategoria: "memes-video" })
    .eq("categoria", "memes-imagem");

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, movidos: total });
}