"use client";

import { useState } from "react";

export default function SetupPage() {
  const [status, setStatus] = useState<{ step: string; ok: boolean; error?: string }[]>([]);

  const sql = `
-- 1. Criar tabelas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  nome TEXT,
  plano TEXT DEFAULT 'gratuito',
  downloads_gratis INTEGER DEFAULT 3,
  criado_em TIMESTAMPTZ DEFAULT now(),
  assinatura_inicio TIMESTAMPTZ,
  assinatura_fim TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  subcategoria TEXT DEFAULT '',
  tipo TEXT DEFAULT 'unico',
  imagem TEXT DEFAULT '',
  download_url TEXT DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arquivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  produto_id UUID REFERENCES produtos(id),
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  valor DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  mes_ref DATE,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Inserir produtos de exemplo
INSERT INTO produtos (nome, descricao, categoria, subcategoria, tipo) VALUES
('Trilha Épica para Jogos', 'Trilha sonora orquestrada para montagens épicas.', 'musica', 'jogos', 'unico'),
('Lo-fi para Vlogs', 'Música Lo-fi relaxante para vlogs.', 'musica', 'vlogs', 'unico'),
('Risada Clássica', 'Memes de risada para momentos engraçados.', 'memes-video', 'humor', 'unico'),
('Surpresa!', 'Meme de susto para react videos.', 'memes-video', 'react', 'unico'),
('Cara de Trolha', 'Imagem clássica de meme para edições.', 'memes-imagem', 'troll', 'unico'),
('Drake Aprova/Desaprova', 'Meme do Drake para comparações.', 'memes-imagem', 'comparacao', 'unico'),
('Explosão Cinematográfica', 'Efeito sonoro de explosão para cenas de ação.', 'efeitos', 'acao', 'unico'),
('Transição Suave', 'Efeito sonoro para transições.', 'efeitos', 'transicao', 'unico'),
('Pack Completo para Gaming', 'Pacote completo para videos de games.', 'packs', 'gaming', 'pack'),
('Pack para Vloggers', 'Tudo para seus vlogs.', 'packs', 'vlogs', 'pack');
  `.trim();

  const copySql = () => {
    navigator.clipboard.writeText(sql);
    setStatus((prev) => [...prev, { step: "SQL copiado!", ok: true }]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Setup do Banco de Dados</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Configure o Supabase para o MonaPacksIA funcionar
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Passo a Passo</h2>
        <ol className="space-y-3 text-sm text-zinc-300">
          <li>1. Acesse <a href="https://supabase.com/dashboard/project/jhpeeuqxrusdmwjkurgk/sql/new" target="_blank" className="text-yellow hover:underline">SQL Editor do Supabase</a></li>
          <li>2. Copie o SQL abaixo clicando no botão</li>
          <li>3. Cole no SQL Editor e execute (Ctrl + Enter)</li>
          <li>4. Volte para o site e pronto!</li>
        </ol>

        <button
          onClick={copySql}
          className="px-4 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors text-sm"
        >
          Copiar SQL
        </button>

        <pre className="bg-black rounded-lg p-4 text-xs text-zinc-400 overflow-x-auto max-h-96 overflow-y-auto border border-zinc-800">
          {sql}
        </pre>
      </div>

      {status.length > 0 && (
        <div className="space-y-2">
          {status.map((s, i) => (
            <div key={i} className="bg-green-900/30 border border-green-800 text-green-400 text-sm rounded-lg px-4 py-2">
              {s.step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
