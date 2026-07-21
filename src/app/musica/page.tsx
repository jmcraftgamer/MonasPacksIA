import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function MusicaPage() {
  const cat = categorias.find((c) => c.id === "musica")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("musica", 60, 0),
    getProdutosCount("musica"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="musica" />;
}
