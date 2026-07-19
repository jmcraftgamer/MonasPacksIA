import { NextResponse } from "next/server";
import { getProdutos } from "@/lib/content/produtos";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");
  const tipo = searchParams.get("tipo");

  let produtos = await getProdutos(categoria || undefined);

  if (tipo) produtos = produtos.filter((p) => p.tipo === tipo);

  return NextResponse.json(produtos);
}
