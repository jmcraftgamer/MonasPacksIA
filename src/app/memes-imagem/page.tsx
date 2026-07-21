import CategorySection from "@/components/CategorySection";
import { getProdutos } from "@/lib/content/produtos";
import { categorias } from "@/data/produtos";

export default async function MemesImagemPage() {
  const cat = categorias.find((c) => c.id === "memes-imagem")!;
  const produtos = await getProdutos("memes-imagem");
  const packs = produtos.filter((p) => p.tipo === "pack");
  const itens = produtos.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} totalCount={produtos.length} />;
}
