"use client";

import { useRef, useState, useEffect } from "react";
import { Produto } from "@/types";
import Link from "next/link";
import { getImageUrl } from "@/lib/image";

interface Props {
  produto: Produto;
}

export default function ProductCard({ produto }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const isVideo = produto.categoria === "memes-video" || produto.categoria === "videos";
  const isAudio = produto.categoria === "musica" || produto.categoria === "efeitos";
  const hasCover = !!produto.imagem;
  const videoUrl = isVideo ? produto.downloadUrl : "";

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!audioRef.current) {
      audioRef.current = new Audio(produto.downloadUrl);
      audioRef.current.onended = () => setAudioPlaying(false);
    }
    if (audioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play().catch(() => {});
    }
    setAudioPlaying(!audioPlaying);
  };

  return (
    <div
      ref={cardRef}
      className="group bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all"
    >
      <Link href={`/produto/${produto.id}`} className="block">
        <div
          className="relative aspect-video bg-zinc-800 overflow-hidden"
          onMouseEnter={() => {
            if (isVideo && videoRef.current && videoUrl) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          }}
          onMouseLeave={() => {
            if (isVideo && videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
        >
          {isVideo ? (
            <>
              <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                {visible && hasCover ? (
                  <img
                    src={getImageUrl(produto.imagem)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-2xl opacity-20">🎬</span>
                )}
              </div>
              {visible && videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                  playsInline
                  muted
                  preload="none"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-yellow/80 flex items-center justify-center">
                  <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : isAudio ? (
            <>
              {visible && hasCover ? (
                <img
                  src={getImageUrl(produto.imagem)}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-zinc-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
              <button
                onClick={toggleAudio}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${audioPlaying ? "bg-yellow" : "bg-yellow/80"}`}>
                  <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    {audioPlaying ? (
                      <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </div>
              </button>
            </>
          ) : (
            <>
              {visible && hasCover ? (
                <img
                  src={getImageUrl(produto.imagem)}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl opacity-20">🖼️</span>
                </div>
              )}
            </>
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
