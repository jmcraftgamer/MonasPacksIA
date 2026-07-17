"use client";

import { useState } from "react";
import Link from "next/link";
import NavTabs from "./NavTabs";
import ChatIA from "./ChatIA";

export default function Header() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="text-white font-semibold text-lg hidden sm:block">
                MonaPacks<span className="text-yellow">IA</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
              >
                Entrar
              </Link>
              <Link
                href="/registrar"
                className="px-4 py-2 rounded-full bg-yellow text-black font-medium text-sm hover:bg-yellow/90 transition-colors"
              >
                Cadastre-se
              </Link>
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:border-yellow hover:text-yellow transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat IA
              </button>
            </div>
          </div>
        </div>
        <NavTabs />
      </header>

      {chatOpen && <ChatIA onClose={() => setChatOpen(false)} />}
    </>
  );
}
