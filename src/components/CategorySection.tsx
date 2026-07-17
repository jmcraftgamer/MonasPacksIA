import { Produto } from "@/types";
import ProductGrid from "./ProductGrid";

interface Props {
  title: string;
  packs: Produto[];
  itens: Produto[];
}

export default function CategorySection({ title, packs, itens }: Props) {
  return (
    <div className="space-y-10">
      <div className="border-b border-zinc-800 pb-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>

      {packs.length > 0 && (
        <ProductGrid produtos={packs} title="Packs" />
      )}

      {itens.length > 0 && (
        <ProductGrid produtos={itens} title="Itens Individuais" />
      )}
    </div>
  );
}
