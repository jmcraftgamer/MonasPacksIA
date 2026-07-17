import { Produto } from "@/types";

export const produtos: Produto[] = [];

export const categorias = [
  { id: "musica" as const, nome: "Músicas", icone: "🎵" },
  { id: "memes-video" as const, nome: "Memes em Vídeo", icone: "🎬" },
  { id: "memes-imagem" as const, nome: "Memes em Imagem", icone: "🖼️" },
  { id: "efeitos" as const, nome: "Efeitos Sonoros", icone: "🔊" },
  { id: "packs" as const, nome: "Packs", icone: "📦" },
];
