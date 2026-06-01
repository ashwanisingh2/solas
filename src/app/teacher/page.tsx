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
  const [reply, setReply] = useState("Choose your mentor mode, language, type your inquiry, and hit Ask to generate an industry-ready guide.");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Strict Mentor");
  const [selectedLang, setSelectedLang] = useState("Hinglish");

  async function askTeacher() {
    setLoading(true);
    try {
      const res = await fetch("/api/phase-a/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: weak.title, 
          question, 
          mode: selectedMode, 
          language: selectedLang 
        }),
      });
      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      console.error(err);
      setReply("Failed to connect to teacher service. Please try again.");
    } finally {
      setLoading(false);
    }
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

        <Card className="p-5 flex flex-col justify-between min-h-[600px]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2 border-b border-white/5 pb-3">
              <span className="text-xs text-zinc-400 self-center mr-2">Tone:</span>
              {["Strict Mentor", "Friendly Mentor", "Corporate Mentor", "Interviewer"].map((mode) => (
                <button 
                  key={mode} 
                  onClick={() => setSelectedMode(mode)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedMode === mode 
                      ? "border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.2)]" 
                      : "border-white/10 text-zinc-300 hover:border-[#00E5FF]/60"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2 border-b border-white/5 pb-3">
              <span className="text-xs text-zinc-400 self-center mr-2">Language:</span>
              {["Hindi", "English", "Hinglish"].map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => setSelectedLang(lang)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedLang === lang 
                      ? "border-[#00FFB3] bg-[#00FFB3]/20 text-[#00FFB3] shadow-[0_0_12px_rgba(0,255,179,0.2)]" 
                      : "border-white/10 text-zinc-300 hover:border-[#00FFB3]/60"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="min-h-96 max-h-[550px] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-200 whitespace-pre-wrap font-sans">
              <div className="mb-3 flex items-center gap-2 text-[#00E5FF] sticky top-0 bg-zinc-950/90 py-1 backdrop-blur-sm z-10">
                <Sparkles size={16} /> GuruAI is thinking with context memory ({selectedMode} | {selectedLang})
              </div>
              {reply}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="rounded-lg border border-white/10 px-3 text-[#00E5FF]"><Mic size={18} /></button>
            <input 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
              placeholder={`Ask your AI teacher about ${weak.title}...`} 
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-[#00E5FF]" 
              onKeyDown={(e) => {
                if (e.key === "Enter" && question.trim() && !loading) {
                  askTeacher();
                }
              }}
            />
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
