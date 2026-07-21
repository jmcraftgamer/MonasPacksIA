import { Produto } from "@/types";
import ProductGridWithMore from "./ProductGridWithMore";

interface Props {
  title: string;
  itens: Produto[];
  totalCount: number;
  categoria: string;
}

export default function CategorySection({ title, itens, totalCount, categoria }: Props) {
  return (
    <div className="space-y-10">
      <div className="border-b border-zinc-800 pb-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>

      {itens.length > 0 ? (
        <ProductGridWithMore initial={itens} total={totalCount} categoria={categoria} />
      ) : (
        <p className="text-zinc-600 text-sm text-center py-16">Nenhum item encontrado.</p>
      )}
    </div>
  );
}