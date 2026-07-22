"use client";

import { useEffect } from "react";

export default function BackgroundPopulate() {
  useEffect(() => {
    const jaFez = localStorage.getItem("populated");
    if (jaFez === "v5") return;
    localStorage.setItem("populated", "v5");
    fetch("/api/populate").catch(() => {});
  }, []);

  return null;
}
