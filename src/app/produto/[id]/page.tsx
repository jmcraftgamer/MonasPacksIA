import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ProductDetail from "./ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params;
  const { data: produto } = await supabaseAdmin.from("produtos").select("*").eq("id", id).single();

  if (!produto) notFound();

  return <ProductDetail produto={produto} />;
}
