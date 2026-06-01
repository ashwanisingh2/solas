/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, Ban } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { assessmentQuestions } from "@/lib/phase-a-data";

interface Question {
  id: string;
  skillId: string;
  question: string;
  options: string[];
  answer: string;
}

export default function AssessmentPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showCheatAlert, setShowCheatAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 1. Randomized Question Sets on Mount
  useEffect(() => {
    const shuffleArray = (array: Question[]) => {
      return [...array].sort(() => Math.random() - 0.5);
    };
    setQuestions(shuffleArray(assessmentQuestions));
  }, []);

  // 2. Copy-Paste Block & Cut Block
  useEffect(() => {
    const handleBlockAction = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerAlert("Integrity Warning: Copy, cut, and paste actions are strictly blocked during assessments!");
    };

    document.addEventListener("copy", handleBlockAction as any);
    document.addEventListener("paste", handleBlockAction as any);
    document.addEventListener("cut", handleBlockAction as any);

    return () => {
      document.removeEventListener("copy", handleBlockAction as any);
      document.removeEventListener("paste", handleBlockAction as any);
      document.removeEventListener("cut", handleBlockAction as any);
    };
  }, []);

  // 3. Tab-Switch / Visibility Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitches((prev) => {
          const newCount = prev + 1;
          triggerAlert(`Integrity Alert: Unapproved window/tab switch detected! (Attempt ${newCount})`);
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setShowCheatAlert(true);
    // Auto-hide alert banner after 5 seconds
    setTimeout(() => {
      setShowCheatAlert(false);
    }, 5000);
  };

  const score = questions.filter((q) => answers[q.id] === q.answer).length;
  const complete = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className="min-h-screen pb-12">
      <Nav />
      
      {/* INTEGRITY ALERT TOAST BANNER */}
      {showCheatAlert && (
        <div className="fixed top-20 right-4 z-50 max-w-md rounded-xl border border-red-500/30 bg-red-950/80 p-4 shadow-[0_0_24px_rgba(239,68,68,0.25)] backdrop-blur animate-in slide-in-from-top-6 duration-200">
          <div className="flex items-start gap-3 text-red-300">
            <ShieldAlert className="mt-0.5 shrink-0 animate-bounce" size={18} />
            <div>
              <p className="text-xs font-mono uppercase tracking-wider font-bold">Anti-Cheat Triggered</p>
              <p className="mt-1 text-xs leading-normal">{alertMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#00FFB3] font-mono">Adaptive baseline</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Skill Assessment</h1>
        </div>

        {/* Tab switch tracker badge */}
        {tabSwitches > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-xs font-mono text-red-400">
            <Ban size={14} />
            <span>Tab Switches: {tabSwitches}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Questions Area */}
        <div className="space-y-4 select-none">
          {questions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono">Initializing assessment modules...</div>
          ) : (
            questions.map((item, index) => (
              <Card key={item.id} className="rounded-xl border-white/10 bg-black/40 p-5 shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-xs font-mono text-zinc-400">
                    Q0{index + 1}
                  </span>
                  <p className="font-semibold text-white leading-relaxed">{item.question}</p>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {item.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswers((current) => ({ ...current, [item.id]: option }))}
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition cursor-pointer ${
                        answers[item.id] === option 
                          ? "border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.08)]" 
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar Status */}
        <aside className="space-y-4">
          <Card className="rounded-xl border-white/10 bg-black/40 p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <CheckCircle2 className="text-[#00FFB3]" size={20} />
              <h2 className="text-lg font-bold text-white font-mono">Exam Console</h2>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Completeness State</p>
              <p className="text-xl font-bold font-mono text-white">
                {questions.length > 0 ? `${Object.keys(answers).length} / ${questions.length}` : "0 / 0"}
              </p>
            </div>

            {complete && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400 font-mono">
                <p className="font-bold">Test Finished!</p>
                <p className="mt-1">Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)</p>
                {tabSwitches > 2 && (
                  <p className="text-red-400 mt-2 font-bold">⚠️ Warning: High tab-switch count may invalidate this attempt.</p>
                )}
              </div>
            )}

            <div className="text-xs text-zinc-400 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-lg">
              This baseline assessment configures your personalized learning path. Tab-switching or copying questions is actively monitored to ensure path accuracy.
            </div>

            <Button className="w-full bg-[#00E5FF] hover:bg-[#00B4D8] text-[#050816] font-bold py-2.5 transition" disabled={!complete}>
              Generate Learning Plan
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
