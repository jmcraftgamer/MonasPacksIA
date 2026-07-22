import { KlipyClient } from "klipy-js";

function getKlipyClient(apiKey: string): KlipyClient {
  return new KlipyClient({ apiKey });
}
const PEXELS_API = "https://api.pexels.com/v1";
const PIXABAY_API = "https://pixabay.com/api";
const EPIDEMIC_API = "https://partner-content-api.epidemicsound.com/v0";
const MYINSTANTS_API = "https://myinstants-api.vercel.app";
const MEME_API = "https://meme-api.com/gimme";
const MEME_IMAGE_SUBS = [
  "memes", "dankmemes", "me_irl", "wholesomememes",
  "AdviceAnimals", "ComedyCemetery", "MemeEconomy",
  "terriblefacebookmemes", "HistoryMemes", "trippinthroughtime",
  "lotrmemes", "prequelmemes", "sequelmemes", "disneymemes",
  "bonehurtingjuice", "nukedmemes", "deepfriedmemes",
  "softwaregore", "ProgrammerHumor", "funny",
  "facepalm", "rareinsults", "clevercomebacks", "technicallythetruth",
  "meme", "wrongnumber", "blackmagicfuckery", "tumblr",
  "brandnewsentence", "blessedimages", "cursedimages", "blursedimages",
  "oddlyspecific", "surrealmemes", "hellsomememes", "comedyheaven",
  "im14andthisisdeep", "boomershumor", "okbuddyretard", "copypasta",
];

interface SearchResult {
  nome: string;
  url: string;
  previewUrl: string;
  origem: string;
  tipo: "imagem" | "video" | "audio";
  popularidade: number;
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

  if (categoria === "memes-video") {
    if (apiKeys.klipy) {
      const clips = await searchKlipy(query, "clips", needed, apiKeys.klipy);
      resultados.push(...clips);
      if (resultados.length < needed) {
        const gifs = await searchKlipy(query, "gifs", needed - resultados.length, apiKeys.klipy);
        resultados.push(...gifs);
      }
    }
    const restantes = needed - resultados.length;
    if (restantes > 0) {
      const memes = await searchMemeApi(restantes);
      resultados.push(...memes);
    }
  }

  if (categoria === "memes-imagem") {
    const memes = await searchMemeApi(needed - resultados.length);
    resultados.push(...memes);
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
    const maxPages = 5;
    for (let page = 1; page <= maxPages; page++) {
      if (resultados.length >= needed) break;
      try {
        const res = await fetch(
          `${PEXELS_API}/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}&type=${pexelsTipo}`,
          { headers: { Authorization: apiKeys.pexels } }
        );
        const data = await res.json();
        const items = (data.photos || data.videos || []).map((p: any, i: number) => ({
          nome: limparNome(p.alt || p.photographer || "meme"),
          url: p.src?.original || p.video_files?.[0]?.link,
          previewUrl: p.src?.medium || p.src?.small || p.src?.tiny || p.video_files?.[0]?.link,
          origem: "pexels",
          tipo: pexelsTipo === "video" ? "video" : "imagem",
          popularidade: (5 - page) * 8000 + (80 - i) * 100,
        })).filter((i: any) => i.url);
        resultados.push(...items);
        if (items.length < 80) break;
      } catch { break; }
    }
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

  return resultados.slice(0, quantidade);
}

async function searchKlipy(query: string, type: string, perPage: number, apiKey: string): Promise<SearchResult[]> {
  try {
    const client = getKlipyClient(apiKey);
    const batchSize = Math.min(perPage, 50);

    if (type === "clips") {
      const page = await client.clips.search({ q: query, perPage: batchSize });
      return (page.data || []).map((item: any) => ({
        nome: limparNome(item.title || item.slug || "meme"),
        url: item.file?.mp4 || item.url,
        previewUrl: item.file?.gif || item.url,
        origem: "klipy",
        tipo: "video" as const,
        popularidade: item.stats?.plays || 0,
      })).filter((i: any) => i.url && i.nome);
    }

    const mediaKey = type === "gifs" ? "gifs" : type === "stickers" ? "stickers" : "memes";
    const clientMethod = client[mediaKey] as any;
    const page = await clientMethod.search({ q: query, perPage: batchSize });
    return (page.data || []).map((item: any) => {
      const f = item.file;
      const best = f?.hd || f?.md || f?.sm || f?.xs || {};
      const url = best.gif?.url || best.webp?.url || best.jpg?.url || best.mp4?.url;
      const thumb = f?.xs?.webp?.url || f?.sm?.webp?.url || f?.xs?.jpg?.url || f?.sm?.jpg?.url || f?.xs?.gif?.url || f?.sm?.gif?.url || best.webp?.url || best.jpg?.url || item.blur_preview || "";
      return {
        nome: limparNome(item.title || item.slug || "meme"),
        url,
        previewUrl: thumb,
        origem: "klipy",
        tipo: "imagem" as const,
        popularidade: item.stats?.plays || 0,
      };
    }).filter((i: any) => i.url && i.nome);
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
        for (const [i, track] of tracks.entries()) {
          if (results.length >= perPage) break;
          results.push({
            nome: limparNome(track.title || track.name || "efeito"),
            url: track.preview_mp3 || track.download_url || track.url,
            previewUrl: "",
            origem: "epidemic",
            tipo: "audio" as const,
            popularidade: (tracks.length - i) * 100,
          });
        }
      }
      return results.filter((i) => i.url && i.nome);
    }
    const url = `${EPIDEMIC_API}/tracks/search?term=${encodeURIComponent(query)}&limit=${Math.min(perPage, 60)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) { console.error(`Epidemic search ${res.status}: ${await res.text()}`); return []; }
    const data = await res.json();
    const tracks = data.tracks || data.results || data.data || [];
    return tracks.map((item: any, i: number) => ({
      nome: limparNome(item.title || item.name || "musica"),
      url: item.preview_mp3 || item.download_url || item.url || item.preview_url,
      previewUrl: item.album_art_url || item.image_url || "",
      origem: "epidemic",
      tipo: "audio" as const,
      popularidade: (tracks.length - i) * 100,
    })).filter((i: any) => i.url && i.nome);
  } catch {
    return [];
  }
}

async function searchMyInstants(query: string, perPage: number): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${MYINSTANTS_API}/search?q=${encodeURIComponent(query)}&limit=${Math.min(perPage, 30)}`);
    const data = await res.json();
    return (data.sounds || data.results || []).map((s: any, i: number) => ({
      nome: limparNome(s.name || s.title || "efeito"),
      url: s.audio_url || s.mp3 || s.url,
      previewUrl: s.image_url || s.thumbnail || "",
      origem: "myinstants",
      tipo: "audio" as const,
      popularidade: ((data.sounds || data.results || []).length - i) * 100,
    })).filter((i: any) => i.url && i.nome);
  } catch {
    return [];
  }
}

async function searchMemeApi(perPage: number): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const subs = MEME_IMAGE_SUBS.slice(0, 12);
  const pool = subs.map((sub) => () => fetch(`${MEME_API}/${sub}/50`).then((r) => r.json()).catch(() => ({ memes: [] })));

  const chunks: any[][] = [];
  for (let i = 0; i < pool.length; i += 5) {
    chunks.push(pool.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    if (results.length >= perPage) break;
    const datas = await Promise.all(chunk.map((fn) => fn()));
    for (const data of datas) {
      if (results.length >= perPage) break;
      for (const meme of (data.memes || [])) {
        if (results.length >= perPage) break;
        if (seen.has(meme.url)) continue;
        seen.add(meme.url);
        const ext = (meme.url || "").split("?")[0].split(".").pop()?.toLowerCase() || "";
        if (ext !== "jpg" && ext !== "jpeg" && ext !== "png" && ext !== "webp") continue;
        const preview = meme.preview?.[meme.preview.length - 1] || meme.url;
        results.push({
          nome: limparNome(meme.title || "meme"),
          url: meme.url,
          previewUrl: preview,
          origem: "memeapi",
          tipo: "imagem",
          popularidade: meme.ups || 0,
        });
      }
    }
  }
  return results;
}

async function searchPixabay(query: string, perPage: number, apiKey: string, tipo: string): Promise<SearchResult[]> {
  try {
    const endpoint = tipo === "audio"
      ? `${PIXABAY_API}/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 50)}&safesearch=true`
      : `${PIXABAY_API}/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 50)}&safesearch=true&image_type=photo`;
    const res = await fetch(endpoint);
    const data = await res.json();
    return (data.hits || []).map((p: any) => ({
      nome: limparNome(p.tags?.split(",")[0]?.trim() || p.user || "imagem"),
      url: p.largeImageURL || p.webformatURL || p.previewURL,
      previewUrl: p.webformatURL || p.previewURL || p.largeImageURL,
      origem: "pixabay",
      tipo: tipo === "audio" ? "audio" as const : "imagem" as const,
      popularidade: (p.likes || 0) * 100 + (p.downloads || 0),
    }));
  } catch {
    return [];
  }
}

function limparNome(nome: string): string {
  const pt: Record<string, string> = {
    funny: "engraçado", meme: "meme", reaction: "reação", comedy: "comédia",
    clip: "clipe", moment: "momento", template: "modelo", image: "imagem",
    png: "png", comic: "cômico", sound: "som", effect: "efeito",
    transition: "transição", explosion: "explosão", background: "fundo",
    music: "música", royalty: "royalty", free: "grátis", upbeat: "animado",
    vlog: "vlog", gaming: "jogos", creative: "criativo", commons: "commons",
    pack: "pack", resource: "recurso", design: "design", assets: "ativos",
    stock: "stock", wallpaper: "papel de parede", photo: "foto",
    video: "vídeo", gif: "gif", sticker: "adesivo",
  };
  let n = nome
    .replace(/[-_]/g, " ")
    .replace(/\.\w+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!n || n.length < 2) return "Meme";
  const palavras = n.split(" ").map((p) => {
    const low = p.toLowerCase();
    return pt[low] || p;
  });
  return palavras
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
    .slice(0, 60);
}

export function getCategoryQueries(categoria: string): string[] {
  const map: Record<string, string[]> = {
    "musica": [
      "background music", "royalty free music", "upbeat music", "vlog music", "gaming music",
      "cinematic music", "dramatic music", "epic music", "inspiring music", "motivational music",
      "ambient music", "relaxing music", "calm music", "peaceful music", "meditation music",
      "pop music", "electronic music", "hip hop beat", "lo fi beat", "trap beat",
      "rock music", "acoustic guitar", "piano music", "jazz music", "blues music",
      "comedy music", "funny soundtrack", "cartoon music", "8 bit music", "retro music",
      "ukulele", "folk music", "indie music", "dance music", "party music",
      "travel vlog", "intro music", "outro music", "sports music", "action music",
      "suspense music", "horror music", "mystery music", "adventure music", "fantasy music",
      "corporate music", "documentary", "podcast intro", "title music", "heroic music",
    ],
    "memes-video": [
      "funny video meme", "reaction meme", "comedy clip", "funny moment", "fail video",
      "cat video", "dog video", "animal funny", "cute animal", "baby funny",
      "funny dance", "funny face", "funny fall", "funny accident", "prank video",
      "funny animal", "crazy video", "funny clip", "comedy video", "meme video",
      "vine style", "sketch comedy", "funny moment", "awkward moment", "funny pet",
      "reaction face", "rage face", "surprised face", "shocked face", "laughing face",
      "funny green screen", "funny greenscreen", "meme template video", "funny sound", "funny edit",
      "transition meme", "warped video", "funny effect", "funny overlay", "meme overlay",
      "funny text video", "meme background", "looping video", "funny loop", "perfect loop",
      "funny clip art", "cartoon funny", "animated meme", "gif video", "reaction clip",
    ],
    "memes-imagem": [
      "funny meme", "reaction image", "comic meme", "funny photo", "funny picture",
      "meme face", "funny face", "cartoon face", "reaction face", "shocked face",
      "laughing face", "funny cat", "funny dog", "meme animal", "cute meme",
      "anime meme", "gaming meme", "internet meme", "viral meme", "funny comic",
      "stream meme", "twitch meme", "discord meme", "emoji meme", "fail photo",
      "funny moment photo", "prank photo", "funny expression", "funny people", "funny group",
      "funny portrait", "funny selfie", "crazy face", "silly face", "funny pose",
      "funny screenshot", "funny text image", "meme template photo", "reaction photo", "comedy photo",
      "funny animal photo", "cute pet photo", "funny bird", "funny monkey", "awkward turtle",
      "funny caption", "meme collection", "dank meme", "meme compilation", "funny fails",
    ],
    "efeitos": [
      "sound effect", "sfx", "transition sound", "explosion sound", "whoosh",
      "click sound", "beep sound", "notification sound", "alarm sound", "bell sound",
      "gun shot", "laser sound", "magic sound", "spell sound", "power up sound",
      "water splash", "fire sound", "thunder sound", "rain sound", "wind sound",
      "footstep sound", "door knock", "door creak", "glass break", "metal clang",
      "cartoon sound", "boing sound", "slide whistle", "drum sound", "cymbal sound",
      "applause", "laugh track", "crowd cheer", "crowd boo", "silence sound",
      "robot sound", "alien sound", "monster sound", "animal sound", "bird sound",
      "car engine", "car horn", "train sound", "plane sound", "helicopter sound",
      "electric sound", "static sound", "glitch sound", "digital sound", "retro game sfx",
    ],
    "packs": [
      "creative commons pack", "resource pack", "design assets", "mega pack", "sound pack",
      "meme pack", "effect pack", "music pack", "video pack", "image pack",
      "bundle pack", "starter pack", "pro pack", "deluxe pack", "complete pack",
      "overlay pack", "transition pack", "green screen pack", "template pack", "icon pack",
      "emote pack", "badge pack", "stinger pack", "lower third pack", "intro pack",
      "stream pack", "gaming pack", "vlog pack", "youtube pack", "twitch pack",
      "tiktok pack", "reels pack", "short pack", "vertical pack", "horizontal pack",
      "free pack", "premium pack", "ultimate pack", "collection pack", "asset pack",
      "motion pack", "animated pack", "static pack", "minimal pack", "retro pack",
      "fantasy pack", "scifi pack", "horror pack", "comedy pack", "action pack",
    ],
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