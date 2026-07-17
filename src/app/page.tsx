import { produtos } from "@/data/produtos";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  const destaques = produtos.slice(0, 5);
  const packs = produtos.filter((p) => p.tipo === "pack");
  const musicas = produtos.filter((p) => p.categoria === "musica");
  const novidades = produtos.slice().reverse().slice(0, 5);

  return (
    <div className="space-y-12">
      <section className="text-center py-8 sm:py-12">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
          MonaPacks<span className="text-yellow">IA</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Sua biblioteca completa de trilhas sonoras, memes, efeitos e packs para youtubers e editores.
        </p>
      </section>

      <ProductGrid produtos={destaques} title="Em Destaque" />

      {packs.length > 0 && <ProductGrid produtos={packs} title="Packs em Alta" />}

      {musicas.length > 0 && <ProductGrid produtos={musicas} title="Músicas Recentes" />}

      <ProductGrid produtos={novidades} title="Novidades" />
    </div>
  );
}
