"use client";

import { useRef, useState } from "react";
import { Produto } from "@/types";
import Link from "next/link";

interface Props {
  produto: Produto;
}

export default function ProductCard({ produto }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  const isVideo = produto.categoria === "memes-video";
  const isImage = produto.categoria === "memes-imagem";
  const hasCover = !!produto.imagem;
  const videoUrl = isVideo ? produto.downloadUrl : "";

  return (
    <div className="group bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all">
      <Link href={`/produto/${produto.id}`} className="block">
        <div
          className="relative aspect-video bg-zinc-800 overflow-hidden"
          onMouseEnter={() => {
            if (videoRef.current && videoUrl) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          }}
          onMouseLeave={() => {
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
        >
          {!loaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
              <span className="text-2xl opacity-20">{isVideo ? "🎬" : "🖼️"}</span>
            </div>
          )}

          {isVideo && hasCover && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={produto.imagem}
              className={`w-full h-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
              playsInline
              muted
              preload="none"
              onLoadedData={() => setLoaded(true)}
            />
          ) : hasCover ? (
            <img
              src={produto.imagem}
              alt={produto.nome}
              className={`w-full h-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">{produto.tipo === "pack" ? "📦" : "🎵"}</span>
            </div>
          )}

          {isVideo && videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-yellow/80 flex items-center justify-center">
                <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produto/${produto.id}`}>
          <h3 className="font-semibold text-white text-sm truncate hover:text-yellow transition-colors">
            {produto.nome}
          </h3>
        </Link>
        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{produto.descricao}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-zinc-600 text-xs capitalize">{produto.subcategoria}</span>
          <button className="w-9 h-9 rounded-full border border-zinc-700 hover:border-yellow hover:bg-yellow/10 transition-all flex items-center justify-center group/btn">
            <svg className="w-4 h-4 text-zinc-400 group-hover/btn:text-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}