import CategorySection from "@/components/CategorySection";
import { getProdutos } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function EfeitosPage() {
  const cat = categorias.find((c) => c.id === "efeitos")!;
  const produtos = await getProdutos("efeitos");
  const packs = produtos.filter((p) => p.tipo === "pack");
  const itens = produtos.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} />;
}
