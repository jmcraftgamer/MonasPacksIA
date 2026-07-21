import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function PacksPage() {
  const cat = categorias.find((c) => c.id === "packs")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("packs", 60, 0),
    getProdutosCount("packs"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="packs" />;
}
