import { Produto } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";

export async function getProdutos(categoria?: string): Promise<Produto[]> {
  let query = supabaseAdmin.from("produtos").select("*");
  if (categoria) query = query.eq("categoria", categoria);
  const { data } = await query;
  return (data || []).map(formatProduto);
}

export async function getProduto(id: string): Promise<Produto | null> {
  const { data } = await supabaseAdmin.from("produtos").select("*").eq("id", id).single();
  return data ? formatProduto(data) : null;
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