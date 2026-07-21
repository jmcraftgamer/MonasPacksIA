"use client";

import { useState } from "react";

interface Props {
  produtoId: string;
  label?: string;
}

export default function DownloadButton({ produtoId, label = "Download" }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [erro, setErro] = useState("");

  const handleDownload = () => {
    setErro("");
    setDownloading(true);

    const link = document.createElement("a");
    link.href = `/api/download/${produtoId}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow text-black font-medium text-sm hover:bg-yellow/90 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {downloading ? "Baixando..." : label}
      </button>
      {erro && (
        <div className="text-red-400 text-xs text-right max-w-48">{erro}</div>
      )}
    </div>
  );
}