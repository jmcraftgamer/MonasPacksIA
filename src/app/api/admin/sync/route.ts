import { NextResponse } from "next/server";
import { searchContent, getCategoryQueries, extractNameFromUrl } from "@/lib/content/downloader";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { categoria, quantidade = 100 } = await request.json();

    if (!categoria) {
      return NextResponse.json({ error: "Categoria obrigatória" }, { status: 400 });
    }

    const queries = getCategoryQueries(categoria);
    const allResults: { url: string; previewUrl: string; origem: string; tipo: string }[] = [];

    for (const query of queries) {
      if (allResults.length >= quantidade) break;
      const results = await searchContent(query, categoria, Math.ceil(quantidade / queries.length), {
        pexels: process.env.PEXELS_API_KEY,
        pixabay: process.env.PIXABAY_API_KEY,
        klipy: process.env.KLIPY_API_KEY,
        epidemic: process.env.EPIDEMIC_API_KEY,
      });
      allResults.push(...results);
    }

    const insercao = allResults.slice(0, quantidade);

    let inseridos = 0;
    for (const item of insercao) {
      const { error } = await supabaseAdmin.from("produtos").insert({
        id: uuidv4(),
        nome: extractNameFromUrl(item.url),
        descricao: `Conteúdo de ${item.origem}`,
        categoria,
        subcategoria: categoria,
        tipo: "unico",
        imagem: item.previewUrl || "",
        download_url: item.url,
      });
      if (!error) inseridos++;
    }

    return NextResponse.json({
      success: true,
      total: insercao.length,
      inseridos,
      categoria,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}