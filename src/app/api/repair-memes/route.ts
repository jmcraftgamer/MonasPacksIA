import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { searchContent, getCategoryQueries } from "@/lib/content/downloader";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const cat = "memes-imagem";

  const { count: antes } = await supabaseAdmin
    .from("produtos")
    .select("*", { count: "exact", head: true })
    .eq("categoria", cat);

  await supabaseAdmin.from("produtos").delete().eq("categoria", cat);

  let inseridos = 0;
  const queries = getCategoryQueries(cat);
  for (const query of queries) {
    try {
      const items = await searchContent(query, cat, 500, {
        pexels: process.env.PEXELS_API_KEY,
        pixabay: process.env.PIXABAY_API_KEY,
        klipy: process.env.KLIPY_API_KEY,
      });
      inseridos += await insertNew(items, cat);
    } catch {}
  }

  return NextResponse.json({ success: true, deletados: antes || 0, inseridos });
}

async function insertNew(
  items: { nome: string; url: string; previewUrl: string; origem: string; tipo: string; popularidade: number }[],
  categoria: string
): Promise<number> {
  const urls = items.map((i) => i.url);
  const { data: existing } = await supabaseAdmin
    .from("produtos")
    .select("download_url")
    .in("download_url", urls);
  const existingUrls = new Set((existing || []).map((r: any) => r.download_url));
  const maxPop = Math.max(...items.map((i) => i.popularidade || 0), 1);

  let count = 0;
  for (const item of items) {
    if (existingUrls.has(item.url)) continue;
    try {
      const now = Date.now();
      const pop = item.popularidade || 0;
      const criadoEm = new Date(now + (pop / maxPop) * 86400000).toISOString();

      await supabaseAdmin.from("produtos").insert({
        id: uuidv4(),
        nome: item.nome || "Item",
        descricao: `Conteúdo de ${item.origem}`,
        categoria,
        subcategoria: categoria,
        tipo: "unico",
        imagem: item.previewUrl || item.url || "",
        download_url: item.url,
        criado_em: criadoEm,
      });
      count++;
    } catch {}
  }
  return count;
}
