import { produtos } from "@/data/produtos";
import CategorySection from "@/components/CategorySection";
import { categorias } from "@/data/produtos";

export default function EfeitosPage() {
  const cat = categorias.find((c) => c.id === "efeitos")!;
  const filtrados = produtos.filter((p) => p.categoria === "efeitos");
  const packs = filtrados.filter((p) => p.tipo === "pack");
  const itens = filtrados.filter((p) => p.tipo === "unico");

  return <CategorySection title={cat.nome} packs={packs} itens={itens} />;
}
