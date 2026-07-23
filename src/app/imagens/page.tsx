import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function ImagensPage() {
  const cat = categorias.find((c) => c.id === "imagens")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("imagens", 60, 0),
    getProdutosCount("imagens"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="imagens" />;
}
