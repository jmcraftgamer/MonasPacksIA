import { Produto } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";
import { searchContent, getCategoryQueries, extractNameFromUrl } from "./downloader";
import { v4 as uuidv4 } from "uuid";

export async function getProdutos(categoria?: string): Promise<Produto[]> {
  let query = supabaseAdmin.from("produtos").select("*");
  if (categoria) query = query.eq("categoria", categoria);
  const { data } = await query;
  const produtos = (data || []).map(formatProduto);

  if (categoria && produtos.length < 5) {
    await populateCategory(categoria);
    const { data: newData } = await supabaseAdmin.from("produtos").select("*").eq("categoria", categoria);
    return (newData || []).map(formatProduto);
  }

  return produtos;
}

async function populateCategory(categoria: string) {
  const queries = getCategoryQueries(categoria);
  const allResults: { url: string; previewUrl: string; origem: string; tipo: string }[] = [];

  for (const query of queries) {
    if (allResults.length >= 100) break;
    try {
      const results = await searchContent(query, categoria, 50, {
        pexels: process.env.PEXELS_API_KEY,
        pixabay: process.env.PIXABAY_API_KEY,
        klipy: process.env.KLIPY_API_KEY,
        epidemic: process.env.EPIDEMIC_API_KEY,
      });
      allResults.push(...results);
    } catch {}
  }

  for (const item of allResults.slice(0, 100)) {
    try {
      await supabaseAdmin.from("produtos").insert({
        id: uuidv4(),
        nome: extractNameFromUrl(item.url),
        descricao: `Conteúdo de ${item.origem}`,
        categoria,
        subcategoria: categoria,
        tipo: "unico",
        imagem: item.previewUrl || "",
        download_url: item.url,
      });
    } catch {}
  }
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