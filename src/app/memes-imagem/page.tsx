import CategorySection from "@/components/CategorySection";
import { getProdutos, getProdutosCount } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function MemesImagemPage() {
  const cat = categorias.find((c) => c.id === "memes-imagem")!;
  const [itens, totalCount] = await Promise.all([
    getProdutos("memes-imagem", 60, 0),
    getProdutosCount("memes-imagem"),
  ]);

  return <CategorySection title={cat.nome} itens={itens} totalCount={totalCount} categoria="memes-imagem" />;
}
