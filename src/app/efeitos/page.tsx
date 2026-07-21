import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function EfeitosPage() {
  const cat = categorias.find((c) => c.id === "efeitos")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("efeitos", 60, 0),
    getProdutosCount("efeitos"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="efeitos" />;
}
