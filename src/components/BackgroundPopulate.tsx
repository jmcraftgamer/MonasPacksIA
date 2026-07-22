"use client";

import { useEffect } from "react";

const VERSAO = "3";

export default function BackgroundPopulate() {
  useEffect(() => {
    const jaFez = localStorage.getItem("populated");
    if (jaFez === VERSAO) return;
    localStorage.setItem("populated", VERSAO);
    fetch("/api/populate").catch(() => {});
  }, []);

  return null;
}