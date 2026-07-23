import { NextResponse } from "next/server";
import { searchContent, getCategoryQueries } from "@/lib/content/downloader";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const CATEGORIAS = ["musica", "memes-video", "memes-imagem", "efeitos", "videos", "imagens", "packs"];

export async function GET() {
  const results: Record<string, number> = {};

  for (const cat of CATEGORIAS) {
    results[cat] = 0;
  }

  const promises = CATEGORIAS.map(async (categoria) => {
    let inseridos = 0;
    const queries = getCategoryQueries(categoria);
    const insertedInRun = new Set<string>();

    for (const query of queries) {
      try {
        const items = await searchContent(query, categoria, 500, {
          pexels: process.env.PEXELS_API_KEY,
          pixabay: process.env.PIXABAY_API_KEY,
          klipy: process.env.KLIPY_API_KEY,
          epidemic: process.env.EPIDEMIC_API_KEY,
        });
        inseridos += await insertNew(items, categoria, insertedInRun);
      } catch {}
    }

    results[categoria] = inseridos;
  });

  await Promise.all(promises);

  return NextResponse.json({ success: true, results });
}

async function insertNew(items: { nome: string; url: string; previewUrl: string; origem: string; tipo: string; popularidade: number }[], categoria: string, insertedInRun: Set<string>): Promise<number> {
  const urls = items.map((i) => i.url);
  const { data: existing } = await supabaseAdmin.from("produtos").select("download_url").in("download_url", urls);
  const existingUrls = new Set((existing || []).map((r: any) => r.download_url));

  let count = 0;
  const batch: any[] = [];

  for (const item of items) {
    if (existingUrls.has(item.url)) continue;
    if (insertedInRun.has(item.url)) continue;

    insertedInRun.add(item.url);
    batch.push({
      id: uuidv4(),
      nome: item.nome || "Item",
      descricao: `Conteúdo de ${item.origem}`,
      categoria,
      subcategoria: categoria,
      tipo: "unico",
      imagem: item.previewUrl || item.url || "",
      download_url: item.url,
    });

    if (batch.length >= 50) {
      const { error } = await supabaseAdmin.from("produtos").insert(batch);
      if (!error) count += batch.length;
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const { error } = await supabaseAdmin.from("produtos").insert(batch);
    if (!error) count += batch.length;
  }

  return count;
}
