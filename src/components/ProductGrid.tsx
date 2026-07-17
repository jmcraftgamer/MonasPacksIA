import { Produto } from "@/types";
import ProductCard from "./ProductCard";

interface Props {
  produtos: Produto[];
  title?: string;
}

export default function ProductGrid({ produtos, title }: Props) {
  if (produtos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-600 text-sm">Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <section>
      {title && (
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {produtos.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
    </section>
  );
}
