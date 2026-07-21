import { Produto } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";
import { searchContent, getCategoryQueries } from "./downloader";
import { v4 as uuidv4 } from "uuid";

const CATEGORIAS = ["musica", "memes-video", "memes-imagem", "efeitos", "packs"];

export async function getProdutos(categoria?: string): Promise<Produto[]> {
  if (!categoria) {
    await Promise.all(CATEGORIAS.map(populateCategory));
    const { data } = await supabaseAdmin.from("produtos").select("*");
    return (data || []).map(formatProduto);
  }

  const { data } = await supabaseAdmin.from("produtos").select("*").eq("categoria", categoria);
  return (data || []).map(formatProduto);
}

export async function getProduto(id: string): Promise<Produto | null> {
  const { data } = await supabaseAdmin.from("produtos").select("*").eq("id", id).single();
  if (!data) return null;
  const produto = formatProduto(data);

  if (produto.tipo === "pack") {
    const { data: arquivos } = await supabaseAdmin
      .from("arquivos")
      .select("*")
      .eq("produto_id", id);
    if (arquivos && arquivos.length > 0) {
      produto.arquivos = arquivos.map((a: any) => ({ nome: a.nome, url: a.url }));
    }
  }

  return produto;
}

async function populateCategory(categoria: string) {
  const queries = getCategoryQueries(categoria);
  for (const query of queries) {
    try {
      const results = await searchContent(query, categoria, 200, {
        pexels: process.env.PEXELS_API_KEY,
        pixabay: process.env.PIXABAY_API_KEY,
        klipy: process.env.KLIPY_API_KEY,
        epidemic: process.env.EPIDEMIC_API_KEY,
      });
      await insertNew(results, categoria);
    } catch {}
  }
}

async function insertNew(items: { nome: string; url: string; previewUrl: string; origem: string; tipo: string }[], categoria: string) {
  const urls = items.map((i) => i.url);
  const { data: existing } = await supabaseAdmin.from("produtos").select("download_url").in("download_url", urls);
  const existingUrls = new Set((existing || []).map((r: any) => r.download_url));

  for (const item of items) {
    if (existingUrls.has(item.url)) continue;
    try {
      const isImage = ["gif", "png", "jpg", "jpeg", "webp"].includes((item.url.split(".").pop() || "").split("?")[0].toLowerCase());
      await supabaseAdmin.from("produtos").insert({
        id: uuidv4(),
        nome: item.nome || "Item",
        descricao: `Conteúdo de ${item.origem}`,
        categoria,
        subcategoria: categoria,
        tipo: "unico",
        imagem: isImage ? item.url : (item.previewUrl || ""),
        download_url: item.url,
      });
    } catch {}
  }
}

function formatProduto(raw: any): Produto {
  return {
    id: raw.id,
    nome: raw.nome,
    descricao: raw.descricao || "",
    categoria: raw.categoria,
    subcategoria: raw.subcategoria || "",
    tipo: raw.tipo || "unico",
    imagem: raw.imagem || "",
    imagens: raw.imagens || undefined,
    arquivoUrl: raw.download_url || raw.arquivo_url || "",
    arquivos: raw.arquivos || undefined,
    downloadUrl: raw.download_url || "",
  };
}