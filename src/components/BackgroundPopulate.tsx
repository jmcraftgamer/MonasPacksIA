"use client";

import { useEffect } from "react";

export default function BackgroundPopulate() {
  useEffect(() => {
    const jaFez = localStorage.getItem("populated");
    if (jaFez) return;
    localStorage.setItem("populated", "true");
    fetch("/api/populate").catch(() => {});
  }, []);

  return null;
}