"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DashboardData {
  totalUsuarios: number;
  assinantes: number;
  gratuitos: number;
  receitaTotal: number;
  receitaMesAtual: number;
  receitaPrevista: number;
  receitaPorMes: { mes: string; valor: number }[];
  diasSemana: { dia: string; count: number }[];
  downloadsPorDia: { data: string; count: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Não autorizado");
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const formatMoney = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { localStorage.removeItem("admin_token"); router.push("/admin/login"); }}
            className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DashboardCard
          label="Usuários"
          value={data.totalUsuarios}
          subtitle={`${data.assinantes} premium · ${data.gratuitos} grátis`}
          color="text-white"
        />
        <DashboardCard
          label="Assinantes"
          value={data.assinantes}
          subtitle="Premium"
          color="text-yellow"
        />
        <DashboardCard
          label="Receita Total"
          value={formatMoney(data.receitaTotal)}
          subtitle="Todos os meses"
          color="text-green-400"
        />
        <DashboardCard
          label="Previsto Próx. Mês"
          value={formatMoney(data.receitaPrevista)}
          subtitle="Estimativa"
          color="text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Downloads por Dia (picos)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.downloadsPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="data" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Line type="monotone" dataKey="count" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cadastros por Dia da Semana">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.diasSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="dia" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Receita por Mês">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.receitaPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mes" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: "#fafafa" }}
                formatter={(value: number) => [formatMoney(value), "Receita"]}
              />
              <Bar dataKey="valor" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição de Planos">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { nome: "Grátis", valor: data.gratuitos },
              { nome: "Premium", valor: data.assinantes },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="nome" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: "#fafafa" }}
              />
              <Bar dataKey="valor" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-zinc-500">Receita Total</span>
            <p className="text-2xl font-bold text-green-400">{formatMoney(data.receitaTotal)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Receita deste Mês</span>
            <p className="text-2xl font-bold text-white">{formatMoney(data.receitaMesAtual)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500">Previsão Próximo Mês</span>
            <p className="text-2xl font-bold text-blue-400">{formatMoney(data.receitaPrevista)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, subtitle, color }: { label: string; value: string | number; subtitle: string; color: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      <p className="text-zinc-600 text-xs mt-0.5">{subtitle}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-white font-medium text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}
