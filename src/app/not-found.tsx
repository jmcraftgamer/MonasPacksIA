import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="text-8xl font-bold text-yellow">404</div>
      <h1 className="text-2xl font-bold text-white">Página não encontrada</h1>
      <p className="text-zinc-400 text-sm max-w-md">
        O conteúdo que você procura não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-yellow text-black font-semibold rounded-full hover:bg-yellow/90 transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
