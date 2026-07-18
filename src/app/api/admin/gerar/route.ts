import { NextResponse } from "next/server";
import { searchContent, downloadFile, getCategoryQueries, extractNameFromUrl } from "@/lib/content/downloader";
import { createPack } from "@/lib/content/packager";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { activeJobs } from "@/lib/content/job-store";

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

    const categoriasValidas = ["musica", "memes-video", "memes-imagem", "efeitos", "packs"];
    if (!categoriasValidas.includes(categoria)) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }

    const jobId = uuidv4();
    const job: { status: string; log: string[]; progress: number } = { status: "iniciando", log: [], progress: 0 };
    activeJobs.set(jobId, job);

    job.log.push(`[${new Date().toISOString()}] Iniciando geração de pack para: ${categoria}`);
    job.log.push(`[${new Date().toISOString()}] Quantidade alvo: ${quantidade} itens`);

    processJob(jobId, categoria, quantidade, job);

    return NextResponse.json({ jobId, message: "Geração iniciada!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const jobs = Array.from(activeJobs.entries()).map(([id, data]) => ({
    id,
    status: data.status,
    log: data.log.slice(-20),
    progress: data.progress,
  }));

  return NextResponse.json({ jobs });
}

async function processJob(jobId: string, categoria: string, quantidade: number, job: { status: string; log: string[]; progress: number }) {
  try {
    const queries = getCategoryQueries(categoria);
    const allResults: { url: string; previewUrl: string; origem: string; tipo: string }[] = [];

    job.log.push(`[${new Date().toISOString()}] Pesquisando conteúdo com ${queries.length} termos...`);

    for (const query of queries) {
      if (allResults.length >= quantidade) break;
      job.status = "pesquisando";
      job.progress = Math.round((allResults.length / quantidade) * 30);

      const results = await searchContent(query, categoria, Math.ceil(quantidade / queries.length), {
        pexels: process.env.PEXELS_API_KEY,
        pixabay: process.env.PIXABAY_API_KEY,
        klipy: process.env.KLIPY_API_KEY,
        epidemic: process.env.EPIDEMIC_API_KEY,
      });

      allResults.push(...results);
      job.log.push(`[${new Date().toISOString()}] "${query}": ${results.length} resultados encontrados`);
    }

    if (allResults.length === 0) {
      job.log.push(`[${new Date().toISOString()}] Nenhum conteúdo encontrado!`);
      job.status = "erro";
      return;
    }

    job.log.push(`[${new Date().toISOString()}] Total: ${allResults.length} itens. Iniciando downloads...`);

    const downloadedItems: { nome: string; url: string; tipo: string }[] = [];
    let sucessos = 0;
    let erros = 0;

    for (let i = 0; i < Math.min(allResults.length, quantidade); i++) {
      const item = allResults[i];
      job.status = "baixando";

      const ext = item.url.split(".").pop()?.split("?")[0] || "png";
      const fileName = `${jobId}/${categoria}/${i}-${Date.now()}.${ext}`;

      const result = await downloadFile(item.url, "conteudo", fileName);

      if (result.url) {
        sucessos++;
        downloadedItems.push({
          nome: extractNameFromUrl(item.url),
          url: result.url,
          tipo: item.tipo,
        });
      } else {
        erros++;
        if (erros <= 10) {
          job.log.push(`[${new Date().toISOString()}] Erro #${i}: ${result.error || "desconhecido"} | ${item.url.slice(0, 60)}`);
        }
      }

      job.progress = 30 + Math.round(((i + 1) / quantidade) * 40);
    }

    job.log.push(`[${new Date().toISOString()}] Downloads: ${sucessos} sucesso, ${erros} erros`);

    if (downloadedItems.length < 3) {
      job.log.push(`[${new Date().toISOString()}] Poucos itens baixados. Abortando.`);
      job.status = "erro";
      return;
    }

    job.status = "organizando";
    job.log.push(`[${new Date().toISOString()}] Criando registros individuais no banco...`);

    const subcategoria = categoria;
    const packNome = `Pack ${categoria === "musica" ? "de Músicas" : categoria === "memes-video" ? "de Memes em Vídeo" : categoria === "memes-imagem" ? "de Memes em Imagem" : categoria === "efeitos" ? "de Efeitos Sonoros" : "Completo"} #${Date.now()}`;

    job.progress = 75;
    job.status = "zipando";
    job.log.push(`[${new Date().toISOString()}] Criando pack: "${packNome}"...`);

    const pack = await createPack(
      packNome,
      `Pack automático com ${downloadedItems.length} itens para ${categoria}. Gerado pelo MonaPacksIA.`,
      categoria,
      subcategoria,
      downloadedItems
    );

    if (!pack) {
      job.log.push(`[${new Date().toISOString()}] Erro ao criar pack!`);
      job.status = "erro";
      return;
    }

    job.progress = 100;
    job.status = "concluido";
    job.log.push(`[${new Date().toISOString()}] Pack publicado! ID: ${pack.packId}`);
    job.log.push(`[${new Date().toISOString()}] Zip: ${pack.zipUrl}`);
    job.log.push(`[${new Date().toISOString()}] Itens no pack: ${downloadedItems.length}`);

  } catch (error: any) {
    job.status = "erro";
    job.log.push(`[${new Date().toISOString()}] ERRO: ${error.message}`);
  }
}
