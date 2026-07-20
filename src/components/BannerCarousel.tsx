"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Produto } from "@/types";

interface Props {
  produtos: Produto[];
}

export default function BannerCarousel({ produtos }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (produtos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % produtos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [produtos.length]);

  if (produtos.length === 0) return null;

  const p = produtos[current];

  return (
    <section className="relative w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
      {produtos.map((prod, i) => (
        <Link
          key={prod.id}
          href={`/produto/${prod.id}`}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
          {prod.imagem ? (
            <img
              src={prod.imagem}
              alt={prod.nome}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span className="text-6xl opacity-30">
                {prod.tipo === "pack" ? "📦" : prod.categoria === "musica" || prod.categoria === "efeitos" ? "🎵" : prod.categoria === "memes-video" ? "🎬" : "🖼️"}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-10">
            <span className="text-xs text-yellow font-medium uppercase tracking-wider">
              {prod.categoria === "musica" ? "Música" : prod.categoria === "memes-video" ? "Meme em Vídeo" : prod.categoria === "memes-imagem" ? "Meme em Imagem" : prod.categoria === "efeitos" ? "Efeito Sonoro" : "Pack"}
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-white mt-1">{prod.nome}</h2>
            <p className="text-zinc-400 text-sm mt-1 line-clamp-2 max-w-xl">{prod.descricao}</p>
          </div>
        </Link>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {produtos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-yellow w-6" : "bg-zinc-600 hover:bg-zinc-400"}`}
          />
        ))}
      </div>
    </section>
  );
}