import { notFound } from "next/navigation";
import { getProduto } from "@/lib/content/produtos";
import ProductDetail from "./ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params;
  const produto = await getProduto(id);

  if (!produto) notFound();

  return <ProductDetail produto={produto} />;
}
