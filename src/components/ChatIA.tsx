"use client";

import { useState } from "react";
import { ChatMessage } from "@/types";

interface Props {
  onClose: () => void;
}

export default function ChatIA({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou a IA do MonaPacks. Como posso ajudar você hoje? Posso montar packs personalizados ou recomendar produtos!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const historico = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, historico }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md sm:mx-4 h-[70vh] sm:h-[500px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow rounded-full" />
            <h2 className="text-white font-semibold">Chat IA</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-yellow text-black rounded-br-md"
                    : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2.5 text-sm border border-zinc-700 focus:outline-none focus:border-yellow transition-colors placeholder-zinc-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-10 h-10 bg-yellow rounded-full flex items-center justify-center hover:bg-yellow/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
