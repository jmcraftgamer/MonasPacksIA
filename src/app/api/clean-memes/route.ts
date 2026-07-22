import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: todos, count: antes } = await supabaseAdmin
    .from("produtos")
    .select("id,descricao,download_url", { count: "exact" })
    .or("descricao.ilike.%memeapi%,download_url.ilike.%redd.it%");

  if (!todos || todos.length === 0) {
    return NextResponse.json({ success: true, deletados: 0, message: "Nenhum item do meme-api encontrado." });
  }

  const ids = todos.map((r: any) => r.id);
  await supabaseAdmin.from("produtos").delete().in("id", ids);

  return NextResponse.json({
    success: true,
    deletados: ids.length,
    total_antes: antes || 0,
    message: `${ids.length} itens do meme-api removidos. Visite a homepage para popular com Klipy.`,
  });
}
