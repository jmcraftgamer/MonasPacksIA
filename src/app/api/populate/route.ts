import { NextResponse } from "next/server";
import { searchContent, getCategoryQueries } from "@/lib/content/downloader";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const CATEGORIAS = ["musica", "memes-video", "memes-imagem", "efeitos", "packs"];

export async function GET() {
  const results: Record<string, number> = {};

  for (const cat of CATEGORIAS) {
    results[cat] = 0;
  }

  const promises = CATEGORIAS.map(async (categoria) => {
    let inseridos = 0;
    const queries = getCategoryQueries(categoria);

    for (const query of queries) {
      try {
        const items = await searchContent(query, categoria, 500, {
          pexels: process.env.PEXELS_API_KEY,
          pixabay: process.env.PIXABAY_API_KEY,
          klipy: process.env.KLIPY_API_KEY,
          epidemic: process.env.EPIDEMIC_API_KEY,
        });
        inseridos += await insertNew(items, categoria);
      } catch {}
    }

    results[categoria] = inseridos;
  });

  await Promise.all(promises);

  return NextResponse.json({ success: true, results });
}

async function insertNew(items: { nome: string; url: string; previewUrl: string; origem: string; tipo: string }[], categoria: string): Promise<number> {
  const urls = items.map((i) => i.url);
  const { data: existing } = await supabaseAdmin.from("produtos").select("download_url").in("download_url", urls);
  const existingUrls = new Set((existing || []).map((r: any) => r.download_url));

  let count = 0;
  for (const item of items) {
    if (existingUrls.has(item.url)) continue;
    try {
      await supabaseAdmin.from("produtos").insert({
        id: uuidv4(),
        nome: item.nome || "Item",
        descricao: `Conteúdo de ${item.origem}`,
        categoria,
        subcategoria: categoria,
        tipo: "unico",
        imagem: item.previewUrl || "",
        download_url: item.url,
      });
      count++;
    } catch {}
  }
  return count;
}