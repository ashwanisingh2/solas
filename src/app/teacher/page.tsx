"use client";
import { useState } from "react";
import { Mic, Send, Sparkles } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { weakestSkills } from "@/lib/phase-a-data";
import { MotionShell } from "@/components/design/motion-shell";
import dynamic from "next/dynamic";

const AiBrainScene = dynamic(() => import("@/components/three/ai-brain").then((mod) => mod.AiBrainScene), { ssr: false });

export default function TeacherPage() {
  const weak = weakestSkills()[0];
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("Start with the symptom, prove the layer, then change the smallest thing that fixes the issue.");
  const [loading, setLoading] = useState(false);

  async function askTeacher() {
    setLoading(true);
    const res = await fetch("/api/phase-a/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: weak.title, question }),
    });
    const data = await res.json();
    setReply(data.reply);
    setLoading(false);
  }

  return (
    <MotionShell>
      <Nav />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative">
            <AiBrainScene />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-widest text-[#00FFB3]">AI Teacher</p>
              <h1 className="mt-2 text-3xl font-semibold">{weak.title}</h1>
              <p className="mt-3 text-zinc-300">Memory active: weak topics, pace, mistakes, and proof quality.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {["Strict Mentor", "Friendly Mentor", "Corporate Mentor", "Interviewer"].map((mode) => (
              <button key={mode} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-[#00E5FF]/60">{mode}</button>
            ))}
            {["Hindi", "English", "Hinglish"].map((lang) => (
              <button key={lang} className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#00FFB3] hover:border-[#00FFB3]/60">{lang}</button>
            ))}
          </div>
          <div className="min-h-48 rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-200">
            <div className="mb-3 flex items-center gap-2 text-[#00E5FF]"><Sparkles size={16} /> GuruAI is thinking with context memory</div>
            {reply}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-lg border border-white/10 px-3 text-[#00E5FF]"><Mic size={18} /></button>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask your AI teacher..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-[#00E5FF]" />
            <Button onClick={askTeacher} disabled={loading || !question.trim()} className="inline-flex items-center gap-2">
              <Send size={16} />
              {loading ? "Thinking" : "Ask"}
            </Button>
          </div>
        </Card>
      </div>
    </MotionShell>
  );
}
