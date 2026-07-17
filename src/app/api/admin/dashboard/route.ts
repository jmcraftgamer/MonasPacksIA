import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: profiles } = await supabase.from("profiles").select("*");
  const { data: downloads } = await supabase.from("downloads").select("*");
  const { data: pagamentos } = await supabase.from("pagamentos").select("*");

  const totalUsuarios = profiles?.length || 0;
  const assinantes = profiles?.filter((p) => p.plano === "premium").length || 0;
  const gratuitos = totalUsuarios - assinantes;

  const receitaTotal = pagamentos?.reduce((acc, p) => acc + Number(p.valor), 0) || 0;

  const receitaPorMes: { mes: string; valor: number }[] = [];
  const diasSemana: { dia: string; count: number }[] = [];
  const downloadsPorDia: { data: string; count: number }[] = [];

  if (pagamentos) {
    const meses: Record<string, number> = {};
    pagamentos.forEach((p) => {
      const mes = new Date(p.criado_em).toLocaleString("pt-BR", { month: "long", year: "numeric" });
      meses[mes] = (meses[mes] || 0) + Number(p.valor);
    });
    Object.entries(meses).forEach(([mes, valor]) => receitaPorMes.push({ mes, valor }));
  }

  if (profiles) {
    const dias: Record<string, number> = {};
    profiles.forEach((p) => {
      const dia = new Date(p.criado_em).toLocaleString("pt-BR", { weekday: "long" });
      dias[dia] = (dias[dia] || 0) + 1;
    });
    Object.entries(dias).forEach(([dia, count]) => diasSemana.push({ dia, count }));
  }

  if (downloads) {
    const dias: Record<string, number> = {};
    downloads.forEach((d) => {
      const data = new Date(d.criado_em).toISOString().split("T")[0];
      dias[data] = (dias[data] || 0) + 1;
    });
    Object.entries(dias).forEach(([data, count]) => downloadsPorDia.push({ data, count }));
  }

  const mesAtual = new Date().getMonth();
  const receitaMesAtual = pagamentos?.filter((p) => new Date(p.criado_em).getMonth() === mesAtual).reduce((acc, p) => acc + Number(p.valor), 0) || 0;
  const receitaPrevista = receitaMesAtual * 1.15;

  return NextResponse.json({
    totalUsuarios,
    assinantes,
    gratuitos,
    receitaTotal,
    receitaMesAtual,
    receitaPrevista: Math.round(receitaPrevista * 100) / 100,
    receitaPorMes,
    diasSemana,
    downloadsPorDia,
  });
}
