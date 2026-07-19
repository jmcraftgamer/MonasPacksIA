import CategorySection from "@/components/CategorySection";
import { supabaseAdmin } from "@/lib/supabase";
import { categorias } from "@/data/produtos";

export default async function MusicaPage() {
  const cat = categorias.find((c) => c.id === "musica")!;
  const { data: produtos } = await supabaseAdmin.from("produtos").select("*").eq("categoria", "musica");
  const filtrados = produtos || [];
  const packs = filtrados.filter((p) => p.tipo === "pack");
  const itens = filtrados.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} />;
}
