import { supabaseAdmin } from "../supabase";
import { KlipyClient } from "klipy-js";

function getKlipyClient(apiKey: string): KlipyClient {
  return new KlipyClient({ apiKey });
}
const PEXELS_API = "https://api.pexels.com/v1";
const PIXABAY_API = "https://pixabay.com/api";
const EPIDEMIC_API = "https://partner-content-api.epidemicsound.com/v0";
const MYINSTANTS_API = "https://myinstants-api.vercel.app";

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
  apiKeys: {
    pexels?: string;
    pixabay?: string;
    klipy?: string;
    epidemic?: string;
  }
): Promise<SearchResult[]> {
  const resultados: SearchResult[] = [];
  const needed = quantidade;

  if (apiKeys.klipy) {
    if (categoria === "memes-video") {
      const clips = await searchKlipy(query, "clips", needed, apiKeys.klipy);
      resultados.push(...clips);
      if (resultados.length < needed) {
        const gifs = await searchKlipy(query, "gifs", needed - resultados.length, apiKeys.klipy);
        resultados.push(...gifs);
      }
    } else if (categoria === "memes-imagem") {
      const gifs = await searchKlipy(query, "gifs", needed, apiKeys.klipy);
      resultados.push(...gifs);
      if (resultados.length < needed) {
        const stickers = await searchKlipy(query, "stickers", needed - resultados.length, apiKeys.klipy);
        resultados.push(...stickers);
      }
    } else if (categoria === "packs") {
      const klipyTypes = ["clips", "gifs", "stickers"] as const;
      for (const t of klipyTypes) {
        if (resultados.length >= needed) break;
        const items = await searchKlipy(query, t, needed - resultados.length, apiKeys.klipy);
        resultados.push(...items);
      }
    }
  }

  if (apiKeys.epidemic) {
    if (categoria === "musica") {
      const tracks = await searchEpidemic(query, "track", needed - resultados.length, apiKeys.epidemic);
      resultados.push(...tracks);
    } else if (categoria === "efeitos") {
      const sfx = await searchEpidemic(query, "sound_effect", needed - resultados.length, apiKeys.epidemic);
      resultados.push(...sfx);
    }
  }

  if (apiKeys.pexels) {
    const pexelsTipo = categoria === "memes-video" ? "video" : "photo";
    try {
      const res = await fetch(`${PEXELS_API}/search?query=${encodeURIComponent(query)}&per_page=${Math.min(needed - resultados.length, 80)}&type=${pexelsTipo}`, {
        headers: { Authorization: apiKeys.pexels },
      });
      const data = await res.json();
      const items = (data.photos || data.videos || []).map((p: any) => ({
        url: p.src?.original || p.video_files?.[0]?.link,
        previewUrl: p.src?.tiny || p.video_files?.[0]?.link,
        origem: "pexels",
        tipo: pexelsTipo === "video" ? "video" : "imagem",
      })).filter((i: any) => i.url);
      resultados.push(...items);
    } catch {}
  }

  if (categoria === "efeitos" || categoria === "packs") {
    const sounds = await searchMyInstants(query, needed - resultados.length);
    resultados.push(...sounds);
  }

  if (apiKeys.pixabay) {
    const tipo = categoria === "musica" || categoria === "efeitos" ? "audio" : "image";
    const pix = await searchPixabay(query, needed - resultados.length, apiKeys.pixabay, tipo);
    resultados.push(...pix);
  }

  if (resultados.length < needed && (categoria === "memes-imagem" || categoria === "packs")) {
    const scraped = await scrapeTransparentPNG(query, needed - resultados.length);
    resultados.push(...scraped);
  }

  return resultados.slice(0, quantidade);
}

async function searchKlipy(query: string, type: string, perPage: number, apiKey: string): Promise<SearchResult[]> {
  try {
    const client = getKlipyClient(apiKey);
    let results: any[];
    if (type === "clips") {
      const page = await client.clips.search({ q: query, perPage: Math.min(perPage, 50) });
      results = (page.data || []).map((item: any) => ({
        url: item.file?.mp4 || item.url,
        previewUrl: item.file?.gif || item.url,
        origem: "klipy",
        tipo: "video" as const,
      }));
    } else {
      const mediaKey = type === "gifs" ? "gifs" : type === "stickers" ? "stickers" : "memes";
      const clientMethod = client[mediaKey] as any;
      const page = await clientMethod.search({ q: query, perPage: Math.min(perPage, 50) });
      results = (page.data || []).map((item: any) => {
        const f = item.file;
        const best = f?.hd || f?.md || f?.sm || f?.xs || {};
        const url = best.gif?.url || best.webp?.url || best.jpg?.url || best.mp4?.url;
        const preview = f?.sm?.gif?.url || f?.sm?.webp?.url || f?.xs?.gif?.url || f?.xs?.webp?.url || item.blur_preview || "";
        return { url, previewUrl: preview, origem: "klipy", tipo: "imagem" as const };
      });
    }
    return results.filter((i: any) => i.url);
  } catch {
    return [];
  }
}

async function searchEpidemic(query: string, type: string, perPage: number, apiKey: string): Promise<SearchResult[]> {
  try {
    const headers = { Authorization: `Bearer ${apiKey}` };
    if (type === "sound_effect") {
      const catRes = await fetch(`${EPIDEMIC_API}/sound-effects/categories`, { headers });
      if (!catRes.ok) { console.error(`Epidemic SFX categories: ${catRes.status} ${await catRes.text()}`); return []; }
      const catData = await catRes.json();
      const categories = catData.categories || catData.data || [];
      const results: SearchResult[] = [];
      for (const cat of categories.slice(0, 3)) {
        if (results.length >= perPage) break;
        const res = await fetch(`${EPIDEMIC_API}/sound-effects/categories/${cat.id}/tracks?limit=${Math.min(perPage - results.length, 50)}`, { headers });
        if (!res.ok) continue;
        const data = await res.json();
        const tracks = data.tracks || data.data || [];
        for (const track of tracks) {
          if (results.length >= perPage) break;
          results.push({
            url: track.preview_mp3 || track.download_url || track.url,
            previewUrl: "",
            origem: "epidemic",
            tipo: "audio" as const,
          });
        }
      }
      return results.filter((i) => i.url);
    }
    const url = `${EPIDEMIC_API}/tracks/search?term=${encodeURIComponent(query)}&limit=${Math.min(perPage, 60)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) { console.error(`Epidemic search ${res.status}: ${await res.text()}`); return []; }
    const data = await res.json();
    const tracks = data.tracks || data.results || data.data || [];
    console.error(`Epidemic search "${query}" => ${tracks.length} tracks`);
    return tracks.map((item: any) => ({
      url: item.preview_mp3 || item.download_url || item.url || item.preview_url,
      previewUrl: item.album_art_url || item.image_url || "",
      origem: "epidemic",
      tipo: "audio" as const,
    })).filter((i: any) => i.url);
  } catch (e: any) {
    console.error(`Epidemic error: ${e.message}`);
    return [];
  }
}

async function searchMyInstants(query: string, perPage: number): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${MYINSTANTS_API}/search?q=${encodeURIComponent(query)}&limit=${Math.min(perPage, 30)}`);
    const data = await res.json();
    return (data.sounds || data.results || []).map((s: any) => ({
      url: s.audio_url || s.mp3 || s.url,
      previewUrl: s.image_url || s.thumbnail || "",
      origem: "myinstants",
      tipo: "audio" as const,
    })).filter((i: any) => i.url);
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
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/webp,image/png,image/gif,video/mp4,audio/mpeg,*/*",
        "Referer": "https://klipy.com/",
      },
    });
    if (!res.ok) {
      console.error(`downloadFile ${url.slice(0, 60)}... => ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const { data } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (!data) return null;
    const { data: publicUrl } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl.publicUrl;
  } catch (e: any) {
    console.error(`downloadFile error: ${e.message}`);
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
