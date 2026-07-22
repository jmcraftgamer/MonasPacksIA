"use client";

import { useEffect } from "react";

const VERSAO = "4";

export default function BackgroundPopulate() {
  useEffect(() => {
    const jaFez = localStorage.getItem("populated");
    if (jaFez === VERSAO) return;
    localStorage.setItem("populated", VERSAO);

    const fn = (clean: boolean) =>
      fetch(`/api/populate${clean ? "?clean=1" : ""}`).catch(() => {});

    fn(true);
    setTimeout(() => fn(false), 3000);
    setTimeout(() => fn(false), 7000);
  }, []);

  return null;
}