"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const registrado = searchParams.get("registrado");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    localStorage.setItem("session", JSON.stringify(data.session));
    router.push("/");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Entrar</h1>
          <p className="text-zinc-400 text-sm mt-1">Acesse sua conta MonaPacksIA</p>
        </div>

        {registrado && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm rounded-lg px-4 py-2">
            Conta criada com sucesso! Faça login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-500">Não tem conta? </span>
          <Link href="/registrar" className="text-yellow hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
