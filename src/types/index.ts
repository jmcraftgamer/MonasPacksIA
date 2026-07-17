export type Categoria =
  | "musica"
  | "memes-video"
  | "memes-imagem"
  | "efeitos"
  | "packs";

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: Categoria;
  subcategoria: string;
  tipo: "unico" | "pack";
  imagem: string;
  imagens?: string[];
  arquivoUrl: string;
  arquivos?: { nome: string; url: string }[];
  downloadUrl: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
