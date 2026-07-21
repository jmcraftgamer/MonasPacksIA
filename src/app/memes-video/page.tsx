import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function MemesVideoPage() {
  const cat = categorias.find((c) => c.id === "memes-video")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("memes-video", 60, 0),
    getProdutosCount("memes-video"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="memes-video" />;
}
