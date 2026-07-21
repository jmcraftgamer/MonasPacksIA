"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncPage() {
  const router = useRouter();
  const [categoria, setCategoria] = useState("musica");
  const [quantidade, setQuantidade] = useState(100);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token) router.push("/admin/login");

  const handleSync = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categoria, quantidade }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(`✅ ${data.inseridos} itens de ${data.total} sincronizados para "${categoria}"`);
      } else {
        setResultado(`❌ Erro: ${data.error}`);
      }
    } catch {
      setResultado("❌ Erro de conexão");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sincronizar Conteúdo</h1>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
        <p className="text-zinc-400 text-sm">
          Busca conteúdo nas APIs externas e salva os links diretamente no banco.
          Os arquivos permanecem nos servidores originais — o site só armazena os links.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow"
            >
              <option value="musica">Músicas</option>
              <option value="memes-video">Memes em Vídeo</option>
              <option value="memes-imagem">Memes em Imagem</option>
              <option value="efeitos">Efeitos Sonoros</option>
              <option value="packs">Packs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Quantidade</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              min={10}
              max={500}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSync}
              disabled={loading}
              className="w-full py-2.5 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Sincronizando..." : "Sincronizar"}
            </button>
          </div>
        </div>

        {resultado && (
          <div className="bg-black rounded-lg p-4 text-sm text-zinc-300">
            {resultado}
          </div>
        )}
      </div>
    </div>
  );
}