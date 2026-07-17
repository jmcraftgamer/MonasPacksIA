import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let produtosUrls: MetadataRoute.Sitemap = [];
  try {
    const { data: produtos } = await supabase.from("produtos").select("id, criado_em");
    produtosUrls = (produtos || []).map((p) => ({
      url: `${baseUrl}/produto/${p.id}`,
      lastModified: new Date(p.criado_em),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {} // Silently fails if Supabase is not configured yet

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/musica`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/memes-video`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/memes-imagem`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/efeitos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/packs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/registrar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...produtosUrls,
  ];
}
