"use client";

import { useRef, useState, useEffect } from "react";
import { Produto } from "@/types";
import Link from "next/link";
import { getImageUrl } from "@/lib/image";

const EXT_MP4 = /\.mp4/i;
const EXT_GIF = /\.gif/i;
const EXT_IMG = /\.(jpg|jpeg|png|webp)/i;

interface Props {
  produto: Produto;
}

export default function ProductCard({ produto }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const url = produto.downloadUrl || "";
  const hasCover = !!produto.imagem;
  const isMp4 = EXT_MP4.test(url);
  const isGif = EXT_GIF.test(url);
  const isImagem = EXT_IMG.test(url) || !(isMp4 || isGif);

  return (
    <div
      ref={cardRef}
      className="group bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all"
    >
      <Link href={`/produto/${produto.id}`} className="block">
        <div
          className="relative aspect-video bg-zinc-800 overflow-hidden"
          onMouseEnter={() => {
            if (videoRef.current) {
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
          {visible && hasCover ? (
            <img
              src={getImageUrl(produto.imagem)}
              alt={isImagem ? produto.nome : ""}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl opacity-20">
                {isMp4 ? "🎬" : isGif ? "🎞️" : "🖼️"}
              </span>
            </div>
          )}

          {visible && isMp4 && (
            <video
              ref={videoRef}
              src={url}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
              playsInline
              muted
              preload="none"
            />
          )}

          {isMp4 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-yellow/80 flex items-center justify-center">
                <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {isGif && (
            <div className="absolute top-2 right-2 bg-black/60 text-yellow text-[10px] font-bold px-1.5 py-0.5 rounded">
              GIF
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