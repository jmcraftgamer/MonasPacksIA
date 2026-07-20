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