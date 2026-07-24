import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const results = { checked: 0, updated: 0, skipped: 0, errors: 0 };

  const origins = ["klipy"];
  for (const origem of origins) {
    let offset = 0;
    const limit = 100;

    while (true) {
      const { data: items, error } = await supabaseAdmin
        .from("produtos")
        .select("id, download_url, imagem, origem, tipo")
        .eq("origem", origem)
        .range(offset, offset + limit - 1);

      if (error) {
        results.errors += 1;
        break;
      }
      if (!items || items.length === 0) break;

      for (const item of items) {
        results.checked += 1;
        const newImagem = upgradePreviewUrl(item.imagem, item.tipo);
        if (newImagem && newImagem !== item.imagem) {
          const { error: updErr } = await supabaseAdmin
            .from("produtos")
            .update({ imagem: newImagem })
            .eq("id", item.id);
          if (!updErr) {
            results.updated += 1;
          } else {
            results.errors += 1;
          }
        } else {
          results.skipped += 1;
        }
      }

      offset += limit;
    }
  }

  return NextResponse.json({ success: true, results });
}

function upgradePreviewUrl(url: string, tipo: string): string | null {
  if (!url) return null;
  if (url.startsWith("https://klipy.com") || url.startsWith("http://klipy.com")) return null;

  let newUrl = url;

  if (tipo === "video") {
    newUrl = newUrl.replace(/\.gif$/i, ".webp");
  }

  newUrl = newUrl
    .replace(/\/xs\/(webp|jpg|gif|png)\//gi, "/hd/$1/")
    .replace(/\/sm\/(webp|jpg|gif|png)\//gi, "/hd/$1/")
    .replace(/\/md\/(webp|jpg|gif|png)\//gi, "/hd/$1/")
    .replace(/\/tiny\//gi, "/large/");

  return newUrl !== url ? newUrl : null;
}
