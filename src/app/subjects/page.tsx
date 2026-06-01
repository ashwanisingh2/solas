"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
const subjects = [{ id: "math", name: "Mathematics", roadmap: "Algebra -> Functions -> Calculus" }, { id: "science", name: "Science", roadmap: "Physics -> Chemistry -> Biology" }];
export default function SubjectsPage() {
  type Roadmap = { roadmap?: { nodes?: { topic_name: string; status: string }[] } };
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  useEffect(() => {
    fetch("/api/intelligence/roadmap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: "demo-user", subject_id: "math", topics: [{ topic_id: "math-1", topic_name: "Algebra Basics", attempts: 2, mastery_score: 90 }, { topic_id: "math-2", topic_name: "Functions", attempts: 1, mastery_score: 60 }] }) }).then((r) => r.json()).then(setRoadmap).catch(() => setRoadmap(null));
  }, []);
  return <div><Nav /><div className="grid gap-4 md:grid-cols-2">{subjects.map((s) => <Card key={s.id}><h3 className="text-lg font-semibold">{s.name}</h3><p className="text-slate-300">{s.roadmap}</p><p className="mt-2 text-xs text-cyan-300">AI Focus: {roadmap?.roadmap?.nodes?.find((n) => n.status === "focus")?.topic_name ?? "Pending"}</p><Link href={`/learn/${s.id}-1`} className="mt-3 inline-block text-cyan-400">Start Topic</Link></Card>)}</div></div>;
}
