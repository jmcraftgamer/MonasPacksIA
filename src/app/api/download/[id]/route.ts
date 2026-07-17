import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const token = _request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: produto } = await supabase.from("produtos").select("*").eq("id", id).single();
    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    if (profile.plano === "premium") {
      await supabase.from("downloads").insert({ user_id: user.id, produto_id: id });
      return NextResponse.json({ downloadUrl: produto.download_url });
    }

    if (produto.tipo === "pack") {
      return NextResponse.json({ error: "Packs são exclusivos para assinantes Premium" }, { status: 403 });
    }

    if (profile.downloads_gratis <= 0) {
      return NextResponse.json({
        error: "Você atingiu o limite de downloads gratuitos. Assine o Premium por R$29,90/mês para downloads ilimitados.",
      }, { status: 403 });
    }

    await supabase.from("downloads").insert({ user_id: user.id, produto_id: id });
    await supabase.from("profiles").update({ downloads_gratis: profile.downloads_gratis - 1 }).eq("id", user.id);

    return NextResponse.json({ downloadUrl: produto.download_url, downloadsRestantes: profile.downloads_gratis - 1 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
