import { notFound } from "next/navigation";
import { produtos } from "@/data/produtos";
import ProductDetail from "./ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params;
  const produto = produtos.find((p) => p.id === id);

  if (!produto) notFound();

  return <ProductDetail produto={produto} />;
}
