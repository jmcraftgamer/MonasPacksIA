"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  produtoId: string;
  label?: string;
}

export default function DownloadButton({ produtoId, label = "Download" }: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [erro, setErro] = useState("");

  const handleDownload = async () => {
    setErro("");
    setDownloading(true);
    setProgress(0);

    const sessionStr = localStorage.getItem("session");
    if (!sessionStr) {
      setErro("Faça login para baixar");
      setDownloading(false);
      return;
    }

    const session = JSON.parse(sessionStr);

    const res = await fetch(`/api/download/${produtoId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error);
      setDownloading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          setProgress(0);
          return 100;
        }
        return prev + Math.random() * 30 + 5;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setDownloading(false);
      setProgress(0);

      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.downloadUrl.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        {downloading && (
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden w-24">
            <div
              className="h-full bg-yellow rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow text-black font-medium text-sm hover:bg-yellow/90 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading ? `${Math.round(Math.min(progress, 100))}%` : label}
        </button>
      </div>
      {erro && (
        <div className="text-red-400 text-xs text-right max-w-48">
          {erro}
          {erro.includes("login") && (
            <button onClick={() => router.push("/login")} className="text-yellow hover:underline ml-1">
              Entrar
            </button>
          )}
          {erro.includes("Premium") && (
            <button onClick={() => router.push("/registrar")} className="text-yellow hover:underline ml-1">
              Assinar Premium
            </button>
          )}
        </div>
      )}
    </div>
  );
}
