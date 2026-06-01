"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#050816] shadow-[0_0_28px_rgba(0,229,255,.28)] transition hover:bg-[#00FFB3] disabled:opacity-50", className)} {...props} />;
}
