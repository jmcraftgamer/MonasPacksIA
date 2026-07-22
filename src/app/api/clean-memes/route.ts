import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: todos } = await supabaseAdmin
    .from("produtos")
    .select("id")
    .or("descricao.ilike.%memeapi%,download_url.ilike.%redd.it%");

  const ids = (todos || []).map((r: any) => r.id);

  if (ids.length === 0) {
    return NextResponse.json({ success: true, deletados: 0, message: "Nenhum item do meme-api encontrado." });
  }

  // Delete in batches of 500 (Supabase limit)
  let deletados = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    const { error } = await supabaseAdmin.from("produtos").delete().in("id", batch);
    if (!error) deletados += batch.length;
  }

  return NextResponse.json({
    success: true,
    deletados,
    total_encontrados: ids.length,
    message: `${deletados} itens do meme-api removidos. Visite a homepage para popular com Klipy.`,
  });
}
