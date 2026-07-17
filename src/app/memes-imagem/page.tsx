import { produtos } from "@/data/produtos";
import CategorySection from "@/components/CategorySection";
import { categorias } from "@/data/produtos";

export default function MemesImagemPage() {
  const cat = categorias.find((c) => c.id === "memes-imagem")!;
  const filtrados = produtos.filter((p) => p.categoria === "memes-imagem");
  const packs = filtrados.filter((p) => p.tipo === "pack");
  const itens = filtrados.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} />;
}
