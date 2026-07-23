import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function VideosPage() {
  const cat = categorias.find((c) => c.id === "videos")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("videos", 60, 0),
    getProdutosCount("videos"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="videos" />;
}
