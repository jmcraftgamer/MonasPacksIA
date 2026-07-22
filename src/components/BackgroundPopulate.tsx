"use client";

import { useEffect } from "react";

export default function BackgroundPopulate() {
  useEffect(() => {
    const jaFez = localStorage.getItem("populated");
    if (jaFez === "v6") return;
    localStorage.setItem("populated", "v6");
    fetch("/api/populate").catch(() => {});
  }, []);

  return null;
}
