"use client";
import { useState } from "react";
import { Nav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
export default function MasteryTestPage() {
  const [score, setScore] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  return <div className="space-y-4"><Nav /><h2 className="text-2xl font-semibold">Mastery Test</h2><Button onClick={async () => { const res = await fetch("/api/mastery", { method: "POST", body: JSON.stringify({ correct: 17, total: 20 }) }); const d = await res.json(); setScore(d.score); setUnlocked(d.unlocked); }}>Submit Test</Button>{score !== null && <p>Score: {score}% | {unlocked ? "Next topic unlocked" : "Locked (need 85%)"}</p>}</div>;
}
