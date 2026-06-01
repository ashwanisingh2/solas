"use client";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
export default function TopicLearningPage() {
  const { topicId } = useParams<{ topicId: string }>(); const r = useRouter();
  return <div className="space-y-4"><Nav /><h2 className="text-2xl font-semibold">Topic: {topicId}</h2><p className="text-slate-300">Concept lesson, practice, and readiness check.</p><Button onClick={() => r.push("/mastery-test")}>Take Mastery Test</Button></div>;
}
