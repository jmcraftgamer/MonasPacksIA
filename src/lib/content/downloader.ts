import { supabaseAdmin } from "../supabase";

const PEXELS_API = "https://api.pexels.com/v1";
const PIXABAY_API = "https://pixabay.com/api";

interface SearchResult {
  url: string;
  previewUrl: string;
  origem: string;
  tipo: "imagem" | "video" | "audio";
}

export async function searchContent(
  query: string,
  categoria: string,
  quantidade: number,
  apiKeys: { pexels?: string; pixabay?: string }
): Promise<SearchResult[]> {
  const resultados: SearchResult[] = [];
  const needed = quantidade;

  if (apiKeys.pexels) {
    const imgs = await searchPexels(query, needed, apiKeys.pexels);
    resultados.push(...imgs);
  }

  if (apiKeys.pixabay) {
    const tipo = categoria === "musica" || categoria === "efeitos" ? "audio" : "image";
    const pix = await searchPixabay(query, needed - resultados.length, apiKeys.pixabay, tipo);
    resultados.push(...pix);
  }

  if (resultados.length < needed) {
    const scraped = await scrapeTransparentPNG(query, needed - resultados.length);
    resultados.push(...scraped);
  }

  return resultados.slice(0, quantidade);
}

async function searchPexels(query: string, perPage: number, apiKey: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${PEXELS_API}/search?query=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 80)}`, {
      headers: { Authorization: apiKey },
    });
    const data = await res.json();
    return (data.photos || []).map((p: any) => ({
      url: p.src.original,
      previewUrl: p.src.tiny,
      origem: "pexels",
      tipo: "imagem" as const,
    }));
  } catch {
    return [];
  }
}

async function searchPixabay(query: string, perPage: number, apiKey: string, tipo: string): Promise<SearchResult[]> {
  try {
    const endpoint = tipo === "audio"
      ? `${PIXABAY_API}/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 50)}&safesearch=true`
      : `${PIXABAY_API}/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 50)}&safesearch=true&image_type=photo`;
    const res = await fetch(endpoint);
    const data = await res.json();
    return (data.hits || []).map((p: any) => ({
      url: p.largeImageURL || p.webformatURL || p.previewURL,
      previewUrl: p.previewURL || p.webformatURL,
      origem: "pixabay",
      tipo: tipo === "audio" ? "audio" as const : "imagem" as const,
    }));
  } catch {
    return [];
  }
}

async function scrapeTransparentPNG(query: string, max: number): Promise<SearchResult[]> {
  const resultados: SearchResult[] = [];
  const sites = [
    `https://www.cleanpng.com/search/${encodeURIComponent(query)}.html`,
    `https://pngimg.com/search?q=${encodeURIComponent(query)}`,
  ];

  for (const siteUrl of sites) {
    if (resultados.length >= max) break;
    try {
      const res = await fetch(siteUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      const html = await res.text();
      const urls = extractPNGUrls(html);
      for (const url of urls) {
        if (resultados.length >= max) break;
        resultados.push({ url, previewUrl: url, origem: "scrape", tipo: "imagem" });
      }
    } catch {
      continue;
    }
  }

  return resultados;
}

function extractPNGUrls(html: string): string[] {
  const urls: string[] = [];
  const regex = /https?:\/\/[^"'\s]+\.(?:png|webp)(?:\?[^"'\s]*)?/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (!urls.includes(match[0])) urls.push(match[0]);
  }
  return urls.slice(0, 20);
}

export async function downloadFile(url: string, bucket: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const { data } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      contentType: res.headers.get("content-type") || "image/png",
      upsert: true,
    });
    if (!data) return null;
    const { data: publicUrl } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl.publicUrl;
  } catch {
    return null;
  }
}

export function getCategoryQueries(categoria: string): string[] {
  const map: Record<string, string[]> = {
    "musica": ["background music", "royalty free music", "upbeat music", "vlog music", "gaming music"],
    "memes-video": ["funny video meme", "reaction meme", "comedy clip", "funny moment"],
    "memes-imagem": ["meme template", "funny image png", "reaction image", "comic png"],
    "efeitos": ["sound effect", "sfx", "transition sound", "explosion sound", "whoosh"],
    "packs": ["creative commons pack", "resource pack", "design assets"],
  };
  return map[categoria] || ["free stock", "creative commons"];
}

export function extractNameFromUrl(url: string): string {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1].split("?")[0];
    return file.replace(/[-_]/g, " ").replace(/\.\w+$/, "").replace(/\b\w/g, (l) => l.toUpperCase());
  } catch {
    return "Item";
  }
}
