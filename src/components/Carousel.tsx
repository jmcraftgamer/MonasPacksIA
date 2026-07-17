"use client";

import { useState } from "react";

interface Props {
  imagens: string[];
}

export default function Carousel({ imagens }: Props) {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % imagens.length);
  const prev = () => setCurrent((prev) => (prev - 1 + imagens.length) % imagens.length);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
      <div className="text-zinc-600 text-4xl">
        {["🎵", "🎬", "🖼️"][current % 3]}
      </div>

      {imagens.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imagens.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-yellow" : "bg-zinc-600"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
