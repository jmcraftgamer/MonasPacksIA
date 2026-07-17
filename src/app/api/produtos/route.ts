import { NextResponse } from "next/server";
import { produtos } from "@/data/produtos";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  const tipo = searchParams.get("tipo");

  let resultado = [...produtos];

  if (categoria) {
    resultado = resultado.filter((p) => p.categoria === categoria);
  }

  if (tipo) {
    resultado = resultado.filter((p) => p.tipo === tipo);
  }

  return NextResponse.json(resultado);
}
