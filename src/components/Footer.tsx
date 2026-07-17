import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow rounded flex items-center justify-center">
              <span className="text-black font-bold text-xs">M</span>
            </div>
            <span className="text-zinc-400 text-sm">
              MonaPacks<span className="text-yellow">IA</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="text-zinc-700 hover:text-zinc-500 transition-colors text-xs">
              Admin
            </Link>
            <p className="text-zinc-600 text-xs">
              &copy; {new Date().getFullYear()} MonaPacksIA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
