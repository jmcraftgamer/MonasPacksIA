"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Produto } from "@/types";
import ProductCard from "./ProductCard";

interface Props {
  initial: Produto[];
  total: number;
  categoria: string;
  limit?: number;
}

export default function ProductGridInfinite({ initial, total, categoria, limit = 60 }: Props) {
  const [items, setItems] = useState<Produto[]>(initial);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || allLoaded) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/produtos?categoria=${categoria}&offset=${items.length}&limit=${limit}`);
      const data = await res.json();
      if (data.produtos.length === 0) {
        setAllLoaded(true);
      } else {
        setItems((prev) => [...prev, ...data.produtos]);
      }
    } catch {
      setAllLoaded(true);
    }
    setLoading(false);
  }, [loading, allLoaded, categoria, items.length, limit]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || allLoaded) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, allLoaded]);

  useEffect(() => {
    if (items.length >= total) setAllLoaded(true);
  }, [items.length, total]);

  return (
    <div>
      <p className="text-zinc-500 text-xs mb-4">Mostrando {items.length} de {total} itens</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
      {!allLoaded && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <span className="text-zinc-500 text-sm">{loading ? "Carregando..." : ""}</span>
        </div>
      )}
    </div>
  );
}