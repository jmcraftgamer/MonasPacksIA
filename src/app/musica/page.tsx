import CategorySection from "@/components/CategorySection";
import { getProdutos } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function MusicaPage() {
  const cat = categorias.find((c) => c.id === "musica")!;
  const produtos = await getProdutos("musica");
  const packs = produtos.filter((p) => p.tipo === "pack");
  const itens = produtos.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} totalCount={produtos.length} />;
}
