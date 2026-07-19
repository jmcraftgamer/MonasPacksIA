import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  const tipo = searchParams.get("tipo");

  let query = supabaseAdmin.from("produtos").select("*");

  if (categoria) query = query.eq("categoria", categoria);
  if (tipo) query = query.eq("tipo", tipo);

  const { data: resultado, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(resultado || []);
}
