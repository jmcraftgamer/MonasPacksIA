"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistrarPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nome }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    router.push("/login?registrado=true");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Cadastre-se para baixar conteúdos gratuitamente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow transition-colors"
              required
              minLength={6}
            />
          </div>

          {erro && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-2">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-500">Já tem conta? </span>
          <Link href="/login" className="text-yellow hover:underline">
            Entrar
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2">
          <h3 className="text-white font-medium text-sm">Planos</h3>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Grátis</span>
            <span className="text-zinc-300">3 downloads de itens individuais</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-yellow font-medium">Premium</span>
            <span className="text-zinc-300">R$29,90/mês - Downloads ilimitados + Packs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
