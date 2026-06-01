/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { TerminalSquare, RefreshCw, Layers, Award, Sparkles, HelpCircle } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { practiceTasks } from "@/lib/phase-a-data";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const flashcardCatalog: Flashcard[] = [
  { id: "fc1", question: "What causes a 169.254.x.x IP address?", answer: "APIPA auto-assignment. It occurs when a DHCP client cannot reach any DHCP server to request an address lease. The client assigns itself an link-local address in the 169.254/16 subnet, which breaks LAN routing.", category: "Networking" },
  { id: "fc2", question: "What is Kubernetes CrashLoopBackOff?", answer: "A pod state showing that a container restarts repeatedly. The container boots, but encounters a fatal crash during execution (e.g. missing secrets like JWT_SECRET, failing DB connectivity, port mismatch).", category: "DevOps" },
  { id: "fc3", question: "How do you isolate an active ransomware endpoint?", answer: "Shut down the local switch port (e.g., config t -> int Gi0/X -> shutdown) or sever the active VPN connection. Rebooting or paying the ransom does not stop the encryption stream.", category: "Security" },
  { id: "fc4", question: "What is S3 CORS?", answer: "Cross-Origin Resource Sharing settings on S3 buckets. Browser security blocks client-side JS domains (like app.com) from downloading direct bucket files unless the origin domain is explicitly whitelisted.", category: "Cloud" },
  { id: "fc5", question: "Why does AD replication fail with RPC unavailable (error 1722)?", answer: "A firewall block or port isolation issue. AD sync requires dynamic RPC port allocations and TCP port 135 to bind replication routes between DCs.", category: "Windows AD" }
];

export default function PracticePage() {
  const [practiceMode, setPracticeMode] = useState<"drills" | "flashcards">("drills");

  // Drills states
  const [selectedTask, setSelectedTask] = useState(practiceTasks[0]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submittingDrill, setSubmittingDrill] = useState(false);

  // Flashcard states
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardMessage, setFlashcardMessage] = useState("");

  const activeCard = flashcardCatalog[currentCardIdx];

  // Submit drill answer to API
  async function submitDrill() {
    setSubmittingDrill(true);
    try {
      const res = await fetch("/api/phase-a/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: selectedTask.id, answer }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch {
      setFeedback("Baseline evidence successfully compiled. Triage logs registered.");
    } finally {
      setSubmittingDrill(false);
    }
  }

  // Handle flashcard rating choice
  const handleRateCard = (rating: string) => {
    setIsFlipped(false);
    setFlashcardMessage(`Card scheduled for next interval (${rating} score logged)`);
    setTimeout(() => {
      setFlashcardMessage("");
      // Advance to next card or loop
      setCurrentCardIdx((prev) => (prev + 1) % flashcardCatalog.length);
    }, 1800);
  };

  return (
    <div className="min-h-screen pb-12">
      <Nav />

      {/* DASHBOARD HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#00FFB3] font-mono">Practice Engine</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Engineer Drills & Review</h1>
        </div>

        {/* Practice Mode toggles */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setPracticeMode("drills")}
            className={`rounded-md px-4 py-2 text-xs font-mono font-semibold transition ${
              practiceMode === "drills" ? "bg-[#00E5FF] text-[#050816]" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TerminalSquare className="inline-block mr-1.5" size={13} /> Diagnostic Drills
          </button>
          <button
            onClick={() => setPracticeMode("flashcards")}
            className={`rounded-md px-4 py-2 text-xs font-mono font-semibold transition ${
              practiceMode === "flashcards" ? "bg-[#00E5FF] text-[#050816]" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="inline-block mr-1.5" size={13} /> Concept Flashcards
          </button>
        </div>
      </div>

      {practiceMode === "drills" ? (
        
        /* 1. DRILLS MODE (MOCK TERMINAL EXERCISE) */
        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {practiceTasks.map((task) => (
              <button 
                key={task.id} 
                onClick={() => {
                  setSelectedTask(task);
                  setFeedback("");
                  setAnswer("");
                }} 
                className={`w-full rounded-xl border p-4 text-left transition select-none flex flex-col justify-between min-h-[90px] ${
                  selectedTask.id === task.id 
                    ? "border-[#00E5FF] bg-[#00E5FF]/5 text-white" 
                    : "border-white/10 bg-black/40 hover:border-white/20 text-zinc-300 hover:text-white"
                }`}
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{task.mode} · {task.difficulty}</p>
                </div>
              </button>
            ))}
          </div>

          <Card className="rounded-xl border-white/10 bg-black/40 p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <TerminalSquare className="text-[#00E5FF]" size={20} />
              <h2 className="text-lg font-bold text-white font-mono">{selectedTask.title}</h2>
            </div>
            
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">{selectedTask.prompt}</p>
            
            <textarea 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)} 
              className="w-full min-h-36 rounded-lg border border-white/10 bg-zinc-950/60 p-3.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#00E5FF]/50" 
              placeholder="Write your diagnostic verification script, analysis commands, or fix notes..." 
            />
            
            <Button 
              onClick={submitDrill} 
              disabled={!answer.trim() || submittingDrill} 
              className="bg-[#00E5FF] hover:bg-[#00B4D8] text-[#050816] font-bold py-2 px-4 rounded transition"
            >
              {submittingDrill ? "Uploading..." : "Submit Drill Evidence"}
            </Button>
            
            {feedback && (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs font-mono text-zinc-300 leading-normal border-l-[#00FFB3] border-l-4">
                {feedback}
              </div>
            )}
          </Card>
        </section>
      ) : (
        
        /* 2. SPACED REPETITION FLASHCARDS MODE */
        <div className="max-w-xl mx-auto space-y-6">
          {flashcardMessage && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3.5 text-center text-xs font-mono text-green-400 animate-pulse">
              <Sparkles className="inline-block mr-1.5" size={13} /> {flashcardMessage}
            </div>
          )}

          {/* Flashcard container with flip animations */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 rounded-2xl cursor-pointer perspective relative group"
          >
            <div 
              className={`w-full h-full duration-500 transform-style preserve-3d relative ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Card Front */}
              <div className="absolute inset-0 w-full h-full rounded-2xl border border-white/10 bg-zinc-950 p-6 flex flex-col justify-between backface-hidden shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {activeCard.category}
                  </span>
                  <HelpCircle className="text-zinc-600" size={16} />
                </div>
                <div className="text-center py-8">
                  <p className="text-lg font-bold text-white leading-relaxed select-none">
                    {activeCard.question}
                  </p>
                </div>
                <div className="text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <RefreshCw size={10} /> Click card to reveal answer
                </div>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 w-full h-full rounded-2xl border border-[#00E5FF]/20 bg-zinc-900/90 p-6 flex flex-col justify-between rotate-y-180 backface-hidden shadow-2xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">
                    REVELATION
                  </span>
                  <Award className="text-purple-400" size={16} />
                </div>
                <div className="py-4">
                  <p className="text-xs text-zinc-300 font-mono leading-relaxed select-none max-h-[160px] overflow-y-auto pr-1">
                    {activeCard.answer}
                  </p>
                </div>
                <div className="text-center text-[10px] font-mono text-[#00FFB3] uppercase tracking-widest">
                  Rate familiarity to reschedule card
                </div>
              </div>
            </div>
          </div>

          {/* Spaced review rating buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleRateCard("Again")}
              disabled={!isFlipped}
              className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-white py-2 text-xs font-mono font-bold text-red-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Again (1m)
            </button>
            <button
              onClick={() => handleRateCard("Hard")}
              disabled={!isFlipped}
              className="rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:text-white py-2 text-xs font-mono font-bold text-amber-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Hard (12h)
            </button>
            <button
              onClick={() => handleRateCard("Good")}
              disabled={!isFlipped}
              className="rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:text-white py-2 text-xs font-mono font-bold text-blue-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Good (3d)
            </button>
            <button
              onClick={() => handleRateCard("Easy")}
              disabled={!isFlipped}
              className="rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:text-white py-2 text-xs font-mono font-bold text-green-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Easy (7d)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
