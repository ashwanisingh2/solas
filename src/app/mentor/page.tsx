"use client";
import { useState } from "react";
import { Nav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
export default function MentorPage() {
  const [q, setQ] = useState(""); const [a, setA] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  return <div className="space-y-4"><Nav /><h2 className="text-2xl font-semibold">AI Mentor</h2><textarea className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-900 p-3" value={q} onChange={(e) => setQ(e.target.value)} /><Button disabled={loading || !q.trim()} onClick={async () => { try { setLoading(true); setError(""); const res = await fetch("/api/mentor", { method: "POST", body: JSON.stringify({ message: q }) }); if (!res.ok) throw new Error("Mentor unavailable"); const data = await res.json(); setA(data.reply || "No response"); } catch { setError("Mentor service unavailable."); } finally { setLoading(false); } }}>{loading ? "Thinking..." : "Ask"}</Button>{error && <div className="rounded-xl border border-red-700 bg-red-950/40 p-3 text-red-200">{error}</div>}{a && <div className="rounded-xl border border-slate-800 p-3">{a}</div>}</div>;
}
