"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categorias } from "@/data/produtos";

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-1 py-3 scrollbar-none">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === "/"
                ? "bg-yellow text-black"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            Início
          </Link>
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                pathname === `/${cat.id}`
                  ? "bg-yellow text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {cat.nome}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
