import { NextResponse } from "next/server";
import { getProduto } from "@/lib/content/produtos";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const produto = await getProduto(id);

  if (!produto) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  return NextResponse.json(produto);
}
