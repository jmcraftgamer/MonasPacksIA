"use client";

import { Produto } from "@/types";
import AudioVisualizer from "@/components/AudioVisualizer";
import DownloadButton from "@/components/DownloadButton";
import Carousel from "@/components/Carousel";
import Link from "next/link";

interface Props {
  produto: Produto;
}

export default function ProductDetail({ produto }: Props) {
  const isMusic = produto.categoria === "musica" || produto.categoria === "efeitos";

  return (
    <div className="space-y-8">
      <Link href={`/${produto.categoria}`} className="inline-flex items-center gap-1 text-zinc-500 hover:text-yellow transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para {produto.categoria === "musica" ? "Músicas" : produto.categoria}
      </Link>

      <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
        <div className="aspect-[21/9] relative bg-zinc-800">
          {isMusic ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <AudioVisualizer />
            </div>
          ) : produto.tipo === "pack" && produto.imagens ? (
            <Carousel imagens={produto.imagens} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">
                {produto.categoria === "memes-video" ? "🎬" : produto.categoria === "memes-imagem" ? "🖼️" : "🎵"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{produto.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-0.5 rounded-full">
                {produto.subcategoria}
              </span>
              <span className="text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-0.5 rounded-full">
                {produto.tipo === "pack" ? "Pack" : "Item único"}
              </span>
            </div>
          </div>

          <DownloadButton produtoId={produto.id} label={produto.tipo === "pack" ? "Download Pack" : "Download"} />
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          {produto.descricao}
        </p>
      </div>

      {produto.tipo === "pack" && produto.arquivos && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Itens do Pack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {produto.arquivos.map((arquivo, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <span className="text-sm">{isMusic ? "🎵" : "📄"}</span>
                  </div>
                  <span className="text-sm text-zinc-300">{arquivo.nome}</span>
                </div>
                <DownloadButton produtoId={produto.id} label="Item" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
