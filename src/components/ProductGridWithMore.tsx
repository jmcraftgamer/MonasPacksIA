"use client";

import { useState } from "react";
import { Produto } from "@/types";
import ProductCard from "./ProductCard";

interface Props {
  initial: Produto[];
  total: number;
  categoria: string;
}

export default function ProductGridWithMore({ initial, total, categoria }: Props) {
  const [items, setItems] = useState<Produto[]>(initial);
  const [loading, setLoading] = useState(false);

  const carregarMais = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/produtos?categoria=${categoria}&offset=${items.length}&limit=60`);
      const data = await res.json();
      setItems((prev) => [...prev, ...data.produtos]);
    } catch {}
    setLoading(false);
  };

  const restante = total - items.length;

  return (
    <div>
      <p className="text-zinc-500 text-xs mb-4">Mostrando {items.length} de {total} itens</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
      {restante > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={carregarMais}
            disabled={loading}
            className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-full hover:border-yellow hover:text-yellow transition-colors text-sm disabled:opacity-50"
          >
            {loading ? "Carregando..." : `Carregar mais ${Math.min(restante, 60)} de ${restante}`}
          </button>
        </div>
      )}
    </div>
  );
}