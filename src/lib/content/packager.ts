import { ZipArchive as Archiver } from "archiver";
import { Readable } from "stream";
import { supabaseAdmin } from "../supabase";
import { v4 as uuidv4 } from "uuid";

interface PackItem {
  nome: string;
  url: string;
  tipo: string;
}

export async function createPack(
  nome: string,
  descricao: string,
  categoria: string,
  subcategoria: string,
  itens: PackItem[]
): Promise<{ packId: string; zipUrl: string } | null> {
  if (itens.length < 1) return null;

  const chunks: Buffer[] = [];

  const archive = new Archiver({ zlib: { level: 1 } });

  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  const archivePromise = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });

  const downloads = await Promise.allSettled(
    itens.map(async (item, i) => {
      try {
        const res = await fetch(item.url);
        if (!res.ok) return null;
        const buffer = Buffer.from(await res.arrayBuffer());
        const ext = item.url.split(".").pop()?.split("?")[0] || "png";
        return { buffer, name: `${i + 1}-${item.nome}.${ext}` };
      } catch {
        return null;
      }
    })
  );

  const validDownloads = downloads
    .filter((d) => d.status === "fulfilled" && d.value)
    .map((d) => (d as PromiseFulfilledResult<{ buffer: Buffer; name: string }>).value);

  for (const d of validDownloads) {
    archive.append(Readable.from(d.buffer), { name: d.name });
  }

  archive.finalize();
  await archivePromise;

  const zipBuffer = Buffer.concat(chunks);

  const packId = uuidv4();
  const zipPath = `packs/${packId}.zip`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("conteudo")
    .upload(zipPath, zipBuffer, {
      contentType: "application/zip",
      upsert: true,
    });

  if (uploadError || !uploadData) return null;

  const { data: publicUrlData } = supabaseAdmin.storage.from("conteudo").getPublicUrl(zipPath);

  const { error: dbError } = await supabaseAdmin.from("produtos").insert({
    id: packId,
    nome,
    descricao,
    categoria,
    subcategoria,
    tipo: "pack",
    download_url: publicUrlData.publicUrl,
  });

  if (dbError) return null;

  for (const item of validDownloads) {
    const itemId = uuidv4();
    const ext = item.name.split(".").pop() || "png";
    const itemPath = `itens/${packId}/${itemId}.${ext}`;

    const { error: itemUploadError } = await supabaseAdmin.storage
      .from("conteudo")
      .upload(itemPath, item.buffer, { upsert: true });

    if (!itemUploadError) {
      const { data: publicUrl } = supabaseAdmin.storage.from("conteudo").getPublicUrl(itemPath);

      await supabaseAdmin.from("produtos").insert({
        id: itemId,
        nome: item.name.replace(/\.[^.]+$/, ""),
        descricao: `Item do pack ${nome}`,
        categoria,
        subcategoria,
        tipo: "unico",
        download_url: publicUrl.publicUrl,
      });

      await supabaseAdmin.from("arquivos").insert({
        produto_id: packId,
        nome: item.name,
        url: publicUrl.publicUrl,
      });
    }
  }

  return { packId, zipUrl: publicUrlData.publicUrl };
}
