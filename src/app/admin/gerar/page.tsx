"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  status: string;
  log: string[];
  progress: number;
}

export default function GerarPage() {
  const router = useRouter();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [categoria, setCategoria] = useState("musica");
  const [quantidade, setQuantidade] = useState(100);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token) router.push("/admin/login");

  const fetchJobs = async () => {
    const res = await fetch("/api/admin/gerar", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setActiveJobs(data.jobs || []);
    }
  };

  useEffect(() => {
    fetchJobs();
    pollingRef.current = setInterval(fetchJobs, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleGerar = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoria, quantidade }),
    });
    setLoading(false);
    if (res.ok) {
      setTimeout(fetchJobs, 1000);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      iniciando: "text-yellow",
      pesquisando: "text-blue-400",
      baixando: "text-blue-400",
      organizando: "text-purple-400",
      zipando: "text-purple-400",
      concluido: "text-green-400",
      erro: "text-red-400",
    };
    return colors[status] || "text-zinc-400";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      iniciando: "Iniciando",
      pesquisando: "Pesquisando conteúdo...",
      baixando: "Baixando arquivos...",
      organizando: "Organizando itens...",
      zipando: "Criando pack .zip...",
      concluido: "Concluído!",
      erro: "Erro",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gerar Packs Automáticos</h1>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Novo Pack</h2>

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
            <label className="block text-sm text-zinc-400 mb-1">Quantidade mínima</label>
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
              onClick={handleGerar}
              disabled={loading}
              className="w-full py-2.5 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Iniciando..." : "Gerar Pack"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Histórico de Geração</h2>

        {activeJobs.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">
            Nenhuma geração em andamento. Clique em "Gerar Pack" para começar.
          </div>
        )}

        {activeJobs.map((job) => (
          <div key={job.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>
              <span className="text-xs text-zinc-600">{job.id.slice(0, 8)}...</span>
            </div>

            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  job.status === "erro" ? "bg-red-500" : job.status === "concluido" ? "bg-green-500" : "bg-yellow"
                }`}
                style={{ width: `${job.progress}%` }}
              />
            </div>

            <div className="bg-black rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
              {job.log.map((entry, i) => (
                <p key={i} className="text-xs text-zinc-500 font-mono">{entry}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
