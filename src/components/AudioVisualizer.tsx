"use client";

import { useMemo } from "react";

interface Props {
  playing?: boolean;
}

export default function AudioVisualizer({ playing }: Props) {
  const bars = useMemo(() =>
    Array.from({ length: 32 }).map(() => Math.random() * 80 + 20),
  []);

  return (
    <div className="flex items-end justify-center gap-1 h-24">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full ${playing ? "bg-yellow animate-pulse" : "bg-yellow/40"}`}
          style={{
            height: `${h}%`,
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${(Math.random() * 0.5 + 0.5)}s`,
            transition: "background-color 0.2s",
          }}
        />
      ))}
    </div>
  );
}
