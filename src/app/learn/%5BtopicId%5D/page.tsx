/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Play, 
  Pause, 
  Volume2, 
  Code, 
  CheckCircle, 
  BookOpen
} from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

const topicLessonDetails: Record<string, {
  title: string;
  duration: string;
  videoTitle: string;
  codeNotes: string;
  quiz: QuizQuestion[];
}> = {
  "active-directory": {
    title: "Active Directory Identity Baseline",
    duration: "14:22",
    videoTitle: "Configuring OUs, Groups, and Group Policies (GPOs) from Scratch",
    codeNotes: `# Active Directory GPO Registry Settings
# Path: \\\\guruai.local\\sysvol\\Policies\\{31B2F...}\\gpt.ini

[General]
Version=1672
displayName=Corporate_Security_Baseline
status=Enabled

# Diagnostic checking tool CLI
$ dcdiag /test:connectivity /v
$ repadmin /replsummary`,
    quiz: [
      { id: "q1", question: "Which command diagnostics tool checks overall Domain Controller system health?", options: ["ipconfig", "dcdiag", "nslookup", "tasklist"], answer: "dcdiag" },
      { id: "q2", question: "Where is the Group Policy file structure stored authoritatively?", options: ["C:\\Windows\\Temp", "SYSVOL folder", "System32\\drivers", "IIS web root"], answer: "SYSVOL folder" },
      { id: "q3", question: "Which service replication method copies Sysvol policy objects across DCs?", options: ["DFSR", "BGP", "SMTP", "FTP"], answer: "DFSR" }
    ]
  },
  "dns-dhcp": {
    title: "DNS and DHCP Resolution Failures",
    duration: "18:40",
    videoTitle: "Triage Dynamic Scope Exhaustion & DNS Journal Corruptions",
    codeNotes: `# DNS Server Cache Flushes & Journal deletes
# Path: C:\\Windows\\System32\\dns\\

# 1. Clear failing zones transaction journal
$ Stop-Service DNS
$ Remove-Item C:\\Windows\\System32\\dns\\guruai.local.dns.jnl
$ Start-Service DNS

# 2. Check leases remaining on DHCP Scope
$ Get-DhcpServerv4Scope -ComputerName DC-01 | Get-DhcpServerv4FreeAddress`,
    quiz: [
      { id: "q1", question: "A corrupt journal file on Windows DNS has which file extension?", options: [".log", ".dns.jnl", ".txt.bak", ".dns.conf"], answer: ".dns.jnl" },
      { id: "q2", question: "An IP address beginning with 169.254.x.x indicates failure in which service?", options: ["DNS Resolution", "DHCP Allocation", "Active Directory Auth", "Gateway Routing"], answer: "DHCP Allocation" },
      { id: "q3", question: "Which CLI command flushes the local DNS client resolver caches?", options: ["ipconfig /renew", "ipconfig /flushdns", "nslookup --flush", "netsh interface reset"], answer: "ipconfig /flushdns" }
    ]
  }
};

export default function TopicLearningPage() {
  const params = useParams<{ topicId: string }>();
  const topicId = params.topicId || "dns-dhcp";
  const router = useRouter();

  // Load correct lesson catalog or default
  const lesson = topicLessonDetails[topicId] || topicLessonDetails["dns-dhcp"];

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [videoTime, setVideoTime] = useState(0);
  const [videoMessage, setVideoMessage] = useState("");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

  // Timer loop for video progress simulation
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setVideoTime((prev) => {
        if (prev >= 120) {
          setIsPlaying(false);
          return 0; // loop back
        }
        return prev + playSpeed;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed]);

  const handleSpeedChange = (speed: number) => {
    setPlaySpeed(speed);
    setVideoMessage(`Playback speed updated to ${speed}x`);
    setTimeout(() => setVideoMessage(""), 2000);
  };

  const handleQuizSubmit = () => {
    const correctCount = lesson.quiz.filter((q) => quizAnswers[q.id] === q.answer).length;
    const isPass = correctCount === lesson.quiz.length; // 100% required for mastery
    setQuizPassed(isPass);
    setQuizSubmitted(true);
  };

  const formatVideoTime = (secCount: number) => {
    const minStr = Math.floor(secCount / 60).toString().padStart(2, "0");
    const secStr = Math.floor(secCount % 60).toString().padStart(2, "0");
    return `${minStr}:${secStr}`;
  };

  return (
    <div className="min-h-screen pb-12">
      <Nav />

      {/* HEADER BAR */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#00FFB3] font-mono">Learning Unit</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{lesson.title}</h1>
        </div>
        <button
          onClick={() => router.push("/learning")}
          className="rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs text-white font-mono transition cursor-pointer"
        >
          &larr; Back to Unlock Map
        </button>
      </div>

      {/* MAIN 2-COLUMN VIEW: LECTURES vs NOTES */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start mb-6">
        
        {/* LEFT COLUMN: MOCK VIDEO PLAYER & STUDY QUIZ */}
        <div className="space-y-6">
          {/* Custom Video Lecture Console */}
          <Card className="overflow-hidden border-white/10 bg-black/50 p-0 shadow-xl">
            <div className="relative aspect-video w-full bg-zinc-950 flex flex-col justify-between p-4 group select-none">
              
              {/* Top video title overlay */}
              <div className="z-10 flex justify-between items-start gap-4">
                <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  Masterclass Lecture
                </span>
                <p className="text-xs font-mono font-semibold text-zinc-400 text-right max-w-xs truncate">
                  {lesson.videoTitle}
                </p>
              </div>

              {/* Center Playback Glow icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#00FFB3] p-4 text-[#050816] hover:scale-110 shadow-[0_0_30px_rgba(0,229,255,0.3)] transition duration-200 cursor-pointer"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
              </div>

              {/* Video message alerts */}
              {videoMessage && (
                <div className="absolute top-12 left-4 z-20 rounded bg-black/80 px-2 py-1 text-[10px] font-mono text-[#00E5FF] border border-[#00E5FF]/20 animate-pulse">
                  {videoMessage}
                </div>
              )}

              {/* Bottom playback task bar */}
              <div className="z-10 space-y-2.5">
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00FFB3]" 
                    style={{ width: `${(videoTime / 120) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white transition">
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <Volume2 size={14} />
                    <span>{formatVideoTime(videoTime)} / {lesson.duration}</span>
                  </div>

                  {/* Speed control selector */}
                  <div className="flex items-center gap-1 bg-white/5 rounded border border-white/5 p-0.5">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`text-[9px] px-1.5 py-0.5 rounded transition ${
                          playSpeed === speed ? "bg-[#00E5FF] text-[#050816] font-bold" : "hover:text-white"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. TOPIC MASTERY TEST (MCQ QUIZ SYSTEM) */}
          <Card className="p-5 border-white/10 bg-black/40 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="text-[#00FFB3]" size={18} /> Topic Mastery Assessment
              </h2>
              {quizPassed !== null && (
                <span className={`rounded-lg px-2.5 py-0.5 text-xs font-mono font-bold border ${
                  quizPassed 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {quizPassed ? "MASTERY PROVEN" : "FAILED (LOCKED)"}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {lesson.quiz.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Question 0{idx + 1}</p>
                  <p className="text-sm font-semibold text-white">{q.question}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt) => {
                      const isSelected = quizAnswers[q.id] === opt;
                      const isCorrect = q.answer === opt;
                      
                      let btnStyle = "border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/5";
                      if (quizSubmitted) {
                        if (isCorrect) btnStyle = "border-green-500/40 bg-green-500/10 text-green-400";
                        else if (isSelected) btnStyle = "border-red-500/40 bg-red-500/10 text-red-400";
                      } else if (isSelected) {
                        btnStyle = "border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]";
                      }

                      return (
                        <button
                          key={opt}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz Action Submit */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <p className="text-xs text-zinc-500">
                You must answer all questions correctly (100%) to prove topic mastery and unlock advanced units.
              </p>
              
              {!quizSubmitted ? (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                  className="bg-[#00E5FF] hover:bg-[#00B4D8] text-[#050816] font-bold whitespace-nowrap"
                >
                  Verify Mastery
                </Button>
              ) : (
                <div className="flex gap-2">
                  {!quizPassed && (
                    <Button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizPassed(null);
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold whitespace-nowrap"
                    >
                      Retry Test
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push("/learning")}
                    className="bg-[#00FFB3] hover:bg-[#00D49C] text-[#050816] font-bold whitespace-nowrap"
                  >
                    Return to Curriculum
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: TEXT NOTES & HIGHLIGHTED CODE EXAMPLES */}
        <div className="space-y-6">
          <Card className="p-5 border-white/10 bg-black/40 space-y-4">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <BookOpen className="text-[#00E5FF]" size={16} /> Course Syllabus & Notes
            </h3>
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans">
              <p>
                Name resolution (DNS) and Identity baselines (AD) act as the foundational pillars of any corporate hybrid network infrastructure.
              </p>
              <p>
                Outage triage requires verifying the exact transport layers systematically:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Check local address scopes (API leases status)</li>
                <li>Audit name directory resolution (host lookup validations)</li>
                <li>Trace route paths through gateway interfaces</li>
              </ul>
            </div>
          </Card>

          {/* Code syntax highlight mock display */}
          <Card className="p-5 border-white/10 bg-black/40 space-y-4">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <Code className="text-[#00FFB3]" size={16} /> Code Cheat Sheet
            </h3>
            
            {/* Monospace Code blocks with custom highlight classes */}
            <div className="rounded-xl border border-white/5 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto select-all leading-normal">
              <pre className="whitespace-pre">
                {/* Visual token representation by highlighting strings */}
                <span className="text-green-500"># Active Directory GPO Registry Configurations</span>{"\n"}
                <span className="text-green-500"># Path: \\\\guruai.local\\sysvol\\Policies\\gpt.ini</span>{"\n"}{"\n"}
                <span className="text-cyan-400">[General]</span>{"\n"}
                <span className="text-[#00E5FF]">Version</span>=<span className="text-yellow-300">1672</span>{"\n"}
                <span className="text-[#00E5FF]">displayName</span>=<span className="text-yellow-300">Corporate_Security_Baseline</span>{"\n"}
                <span className="text-[#00E5FF]">status</span>=<span className="text-yellow-300">Enabled</span>{"\n"}{"\n"}
                <span className="text-green-500"># Diagnostic checking tools</span>{"\n"}
                <span className="text-pink-400">$ dcdiag</span> /test:connectivity /v{"\n"}
                <span className="text-pink-400">$ repadmin</span> /replsummary
              </pre>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
