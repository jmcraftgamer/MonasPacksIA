import { Produto } from "@/types";
import ProductGrid from "./ProductGrid";

interface Props {
  title: string;
  packs: Produto[];
  itens: Produto[];
  totalCount?: number;
}

export default function CategorySection({ title, packs, itens, totalCount }: Props) {
  return (
    <div className="space-y-10">
      <div className="border-b border-zinc-800 pb-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {totalCount !== undefined && (
          <p className="text-zinc-500 text-xs mt-1">{totalCount} itens no total</p>
        )}
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
