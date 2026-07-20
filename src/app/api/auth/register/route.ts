import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password, nome } = await request.json();

    if (!email || !password || !nome) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        nome,
        plano: "gratuito",
        downloads_gratis: 3,
      });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ success: true, user: authData.user });
    }

    return NextResponse.json({
      success: true,
      user: sessionData.user,
      session: sessionData.session,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
