import CategorySection from "@/components/CategorySection";
import { getProdutos } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function PacksPage() {
  const cat = categorias.find((c) => c.id === "packs")!;
  const produtos = await getProdutos("packs");
  const packs = produtos.filter((p) => p.tipo === "pack");
  const itens = produtos.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} totalCount={produtos.length} />;
}
