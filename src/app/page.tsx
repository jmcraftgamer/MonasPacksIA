import Link from "next/link";
import { categorias } from "@/data/produtos";
import { getProdutos } from "@/lib/content/produtos";
import BannerCarousel from "@/components/BannerCarousel";
import BackgroundPopulate from "@/components/BackgroundPopulate";

export default async function Home() {
  const todos = await getProdutos();
  const produtos = todos.filter((p) => p.imagem);

  return (
    <div className="space-y-12">
      <BackgroundPopulate />

      <BannerCarousel produtos={produtos} />

      <section className="text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
          MonaPacks<span className="text-yellow">IA</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Sua biblioteca completa de trilhas sonoras, memes, efeitos e packs para youtubers e editores.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link
            href="/registrar"
            className="px-6 py-3 bg-yellow text-black font-semibold rounded-full hover:bg-yellow/90 transition-colors text-sm"
          >
            Criar Conta Grátis
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-full hover:border-yellow hover:text-yellow transition-colors text-sm"
          >
            Entrar
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4 text-center">Categorias</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categorias.map((cat) => {
            const count = todos.filter((p) => p.categoria === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/${cat.id}`}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center hover:border-yellow transition-colors group"
              >
                <div className="text-2xl mb-2">{cat.icone}</div>
                <span className="text-zinc-400 group-hover:text-white text-sm font-medium transition-colors">
                  {cat.nome}
                </span>
                <p className="text-zinc-600 text-xs mt-1">{count} itens</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}