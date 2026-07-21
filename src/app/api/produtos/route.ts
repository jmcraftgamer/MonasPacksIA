import { NextResponse } from "next/server";
import { getProdutos } from "@/lib/content/produtos";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria") || "";
  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Number(searchParams.get("limit")) || 60;

  const produtos = await getProdutos(categoria, limit, offset);
  return NextResponse.json({ produtos });
}