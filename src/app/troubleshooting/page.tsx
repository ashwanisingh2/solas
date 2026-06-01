/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldAlert, 
  Play, 
  History, 
  CheckCircle, 
  XCircle, 
  Layers,
  Info,
  ChevronRight,
  X
} from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { incidentCatalog, IncidentTemplate } from "@/lib/incident-catalog";

function TroubleshootingQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionSummaryId = searchParams.get("sessionSummaryId");

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedIncident, setSelectedIncident] = useState<IncidentTemplate | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [summarySession, setSummarySession] = useState<any | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [launchingSession, setLaunchingSession] = useState(false);

  // Categories list
  const categories = ["ALL", "WINDOWS", "NETWORK", "CLOUD", "DEVOPS", "SECURITY"];

  // Roles list
  const roles = [
    "IT Support Engineer",
    "System Engineer",
    "Network Engineer",
    "Cloud Engineer",
    "DevOps Engineer",
    "Incident Commander"
  ];

  // Fetch past sessions
  const fetchPastSessions = async () => {
    try {
      const res = await fetch("/api/troubleshooting/session");
      if (res.ok) {
        const data = await res.json();
        setPastSessions(data);
      }
    } catch (err) {
      console.error("Failed to load sessions history:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchPastSessions();
  }, []);

  // Fetch summary if sessionSummaryId is provided
  useEffect(() => {
    if (!sessionSummaryId) {
      setSummarySession(null);
      return;
    }

    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const res = await fetch(`/api/troubleshooting/session/${sessionSummaryId}`);
        if (res.ok) {
          const data = await res.json();
          setSummarySession(data);
        }
      } catch (err) {
        console.error("Failed to load session summary:", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [sessionSummaryId]);

  // Filter templates
  const filteredTemplates = activeCategory === "ALL" 
    ? incidentCatalog 
    : incidentCatalog.filter((i) => i.domain === activeCategory);

  // Start Outage Simulation
  const handleLaunchIncident = async () => {
    if (!selectedIncident) return;
    setLaunchingSession(true);
    try {
      const res = await fetch("/api/troubleshooting/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          incidentId: selectedIncident.id, 
          role: selectedRole || selectedIncident.role 
        }),
      });

      if (res.ok) {
        const session = await res.json();
        router.push(`/troubleshooting/${session.id}`);
      } else {
        alert("Failed to start incident simulation");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating war room session");
    } finally {
      setLaunchingSession(false);
    }
  };

  // Helper formatting for durations
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen pb-12">
      <Nav />

      {/* DASHBOARD HEADER */}
      <div className="mb-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#00FFB3] font-mono">GuruAI Operating System</p>
          <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">AI War Room</h1>
          <p className="mt-2 text-zinc-400 max-w-2xl text-sm leading-relaxed">
            Not a quiz. This is a real-time production incident simulation platform. Train on 25 critical IT outages, cloud failures, CI/CD blocks, and cyber attacks. Prove your root cause analysis, configure solutions, and close communication loops.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-start md:justify-end">
          <Card className="px-5 py-3.5 border-white/10 bg-black/40 text-center min-w-[120px]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Global Rank</p>
            <p className="text-2xl font-bold text-[#00E5FF] mt-1 font-mono">#14</p>
          </Card>
          <Card className="px-5 py-3.5 border-white/10 bg-black/40 text-center min-w-[120px]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MTTR (Avg)</p>
            <p className="text-2xl font-bold text-red-400 mt-1 font-mono">5.2m</p>
          </Card>
          <Card className="px-5 py-3.5 border-white/10 bg-black/40 text-center min-w-[120px]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SLA Compliance</p>
            <p className="text-2xl font-bold text-green-400 mt-1 font-mono">92.4%</p>
          </Card>
        </div>
      </div>

      {/* MAIN LAYOUT: INCIDENTS OR REPORT SUMMARY */}
      {sessionSummaryId && summarySession ? (
        
        /* POST INCIDENT REPORT (RCA) MODE */
        <div className="space-y-6">
          {/* Back button */}
          <button 
            onClick={() => router.push("/troubleshooting")}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#00E5FF] hover:underline"
          >
            &larr; Back to Incident Queue
          </button>

          {summaryLoading ? (
            <div className="py-12 text-center text-zinc-500 font-mono">Loading Post Incident Report...</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              {/* Left Column: Formal Report */}
              <div className="space-y-6">
                <Card className="p-6 border-white/10 bg-black/50 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-l from-green-500/10 to-transparent border-l border-b border-green-500/20 px-3 py-1 font-mono text-[10px] text-green-400">
                    STATUS: RESOLVED // ARCHIVED
                  </div>
                  
                  <div>
                    <span className="text-xs font-mono font-semibold tracking-wider text-green-400 uppercase">
                      POST INCIDENT ANALYSIS & RCA
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      {summarySession.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      Outage Session: {summarySession.id} · Role: {summarySession.role}
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs font-mono leading-normal text-zinc-300">
                    <p className="font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Info size={14} className="text-[#00E5FF]" /> Executive Summary
                    </p>
                    {summarySession.postIncidentReport?.summary}
                  </div>

                  {/* 1. Root Cause Analysis */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                      1. Root Cause Analysis (RCA)
                    </h3>
                    <div className="rounded-lg bg-zinc-950 p-4 border border-white/5 space-y-3">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">Student Diagnosis Conclusion:</p>
                        <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                          {summarySession.postIncidentReport?.rca}
                        </p>
                      </div>
                      <div className="border-t border-white/5 pt-3">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">Underlying Expected Root Cause:</p>
                        <p className="text-xs text-[#00FFB3] mt-1 leading-relaxed">
                          {summarySession.postIncidentReport?.expectedRca}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Impact Analysis */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                      2. Impact Analysis & Resolution
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-white/[0.01] border border-white/5 p-4 text-xs">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Financial Damage</p>
                        <p className="text-lg font-bold text-red-400 font-mono">
                          ${summarySession.financialLoss.toLocaleString()} USD
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Based on duration and customer burn rate</p>
                      </div>
                      <div className="rounded-lg bg-white/[0.01] border border-white/5 p-4 text-xs">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Applied Remediation Fix</p>
                        <p className="text-sm font-bold text-green-400 font-mono">
                          {summarySession.remediationAction}
                        </p>
                        <p className="text-[10px] text-zinc-400 leading-normal mt-1 italic">
                          {summarySession.postIncidentReport?.resolution}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Lessons Learned */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                      3. Incident Takeaways & Lessons Learned
                    </h3>
                    <div className="rounded-lg bg-white/[0.01] border border-white/5 p-4 text-xs text-zinc-300 leading-relaxed font-mono">
                      {summarySession.postIncidentReport?.lessonsLearned}
                    </div>
                  </div>

                  {/* 4. Preventive Actions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                      4. Long-Term Preventive Actions Committed
                    </h3>
                    <ul className="space-y-1.5">
                      {summarySession.postIncidentReport?.preventiveActions.map((act: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-zinc-300 font-mono">
                          <span className="text-[#00FFB3] mt-0.5">&bull;</span>
                          <span>{act.split(" (")[0]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                {/* Incident Triage Timeline */}
                <Card className="p-6 border-white/10 bg-black/50">
                  <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-4">
                    5. Chronological Incident Triage Timeline
                  </h3>
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10 pl-6">
                    {summarySession.postIncidentReport?.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="relative text-xs">
                        <span className="absolute -left-[22px] top-1 flex h-2 w-2 rounded-full bg-white/20 border border-[#050816]"></span>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-zinc-300 font-semibold">{event.description}</p>
                            <span className="mt-0.5 inline-block rounded bg-white/5 border border-white/5 px-1.5 py-0.2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                              {event.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                            {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column: Score Breakdown */}
              <div className="space-y-6">
                <Card className="p-5 border-white/10 bg-black/40 text-center space-y-4">
                  <div>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">OVERALL RESPONSE SCORE</p>
                    <div className="relative flex items-center justify-center py-6">
                      <div className="text-5xl font-extrabold font-mono text-[#00FFB3] drop-shadow-[0_0_20px_rgba(0,255,179,0.3)]">
                        {summarySession.score}%
                      </div>
                    </div>
                    <span className="rounded bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                      MTTR: {formatDuration(summarySession.timeElapsed)}
                    </span>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3.5 text-left">
                    <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Triage Dimensions</h4>
                    
                    {/* Progress Bar 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-300">
                        <span>Investigation Speed</span>
                        <span>{summarySession.scoresBreakdown?.speed || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00E5FF]" 
                          style={{ width: `${summarySession.scoresBreakdown?.speed || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-300">
                        <span>Root Cause Accuracy</span>
                        <span>{summarySession.scoresBreakdown?.rcaAccuracy || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400" 
                          style={{ width: `${summarySession.scoresBreakdown?.rcaAccuracy || 0}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal pt-1 font-mono italic">
                        &quot;{summarySession.scoresBreakdown?.rcaFeedback}&quot;
                      </p>
                    </div>

                    {/* Progress Bar 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-300">
                        <span>Resolution Quality</span>
                        <span>{summarySession.scoresBreakdown?.resolutionQuality || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400" 
                          style={{ width: `${summarySession.scoresBreakdown?.resolutionQuality || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar 4 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-300">
                        <span>Communication Loop</span>
                        <span>{summarySession.scoresBreakdown?.communication || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400" 
                          style={{ width: `${summarySession.scoresBreakdown?.communication || 0}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal pt-1 font-mono italic">
                        &quot;{summarySession.scoresBreakdown?.commFeedback}&quot;
                      </p>
                    </div>

                    {/* Progress Bar 5 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-zinc-300">
                        <span>Prevention Architecture</span>
                        <span>{summarySession.scoresBreakdown?.prevention || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-400" 
                          style={{ width: `${summarySession.scoresBreakdown?.prevention || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-white/10 bg-black/40 space-y-4">
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Triage Communications logged</h4>
                  <div className="space-y-2">
                    {summarySession.communicationLogs && summarySession.communicationLogs.map((log: any, idx: number) => (
                      <div key={idx} className="rounded bg-white/[0.02] border border-white/5 p-3 text-xs leading-normal">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                          <span>Target: {log.target}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-zinc-300">&quot;{log.text}&quot;</p>
                      </div>
                    )) || (
                      <p className="text-xs text-zinc-500 italic">No communication logs recorded during simulation.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      ) : (
        
        /* INCIDENT QUEUE SELECTION AND HISTORY MODE */
        <div className="space-y-8">
          
          {/* CATEGORY SELECTOR */}
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIncident(null);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-mono font-semibold transition ${
                  activeCategory === cat 
                    ? "bg-[#00E5FF] text-[#050816] shadow-[0_0_24px_rgba(0,229,255,0.2)]" 
                    : "text-zinc-400 hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            
            {/* LEFT COLUMN: FILTERED INCIDENTS GRID */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Layers size={18} className="text-[#00E5FF]" /> Active Simulation Catalog
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      setSelectedIncident(template);
                      setSelectedRole(template.role);
                    }}
                    className={`rounded-xl border p-5 cursor-pointer text-left transition select-none flex flex-col justify-between min-h-[190px] ${
                      selectedIncident?.id === template.id
                        ? "border-[#00E5FF] bg-[#00E5FF]/5 shadow-[0_0_24px_rgba(0,229,255,0.08)]"
                        : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                          {template.domain}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          template.severity === "P1" 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : template.severity === "P2"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {template.severity}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-white mt-3">{template.title}</h3>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {template.symptoms}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Burn: ${template.businessImpact.financialLossPerMinute}/m</span>
                      <span className="flex items-center gap-1 text-[#00E5FF] font-semibold">
                        Enter Room <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: SANDBOX CONFIG OR ACTIVE DRAWER */}
            <div className="space-y-6">
              
              {/* INCIDENT sandBOX DRAWER CONFIG */}
              {selectedIncident ? (
                <Card className="p-6 border-[#00E5FF]/20 bg-[#00E5FF]/5 shadow-[0_0_30px_rgba(0,229,255,0.05)] space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest font-semibold">
                        Ready to Deploy
                      </span>
                      <button 
                        onClick={() => setSelectedIncident(null)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1.5">{selectedIncident.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">Outage Domain: {selectedIncident.domain}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="rounded-lg bg-zinc-950/40 border border-white/5 p-3.5 space-y-2 leading-relaxed text-zinc-300">
                      <p className="font-semibold text-white">Symptoms Reported:</p>
                      <p>&quot;{selectedIncident.symptoms}&quot;</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg bg-black/30 p-2.5 border border-white/5">
                        <p className="text-[9px] font-mono text-zinc-500 uppercase">Impact SLA</p>
                        <p className="text-sm font-bold text-red-400 font-mono mt-0.5">
                          ${selectedIncident.businessImpact.financialLossPerMinute}/min
                        </p>
                      </div>
                      <div className="rounded-lg bg-black/30 p-2.5 border border-white/5">
                        <p className="text-[9px] font-mono text-zinc-500 uppercase">Affected Node</p>
                        <p className="text-xs font-bold text-[#00FFB3] truncate mt-0.5">
                          {selectedIncident.domain === "CLOUD" ? "us-east-1 ALB" : selectedIncident.domain === "DEVOPS" ? "k8s-pod-auth" : "PDC-01.local"}
                        </p>
                      </div>
                    </div>

                    {/* Select Role */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                        Choose your Active Engineering Role
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00E5FF]/50"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role} className="bg-[#050816] text-white">
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchIncident}
                    disabled={launchingSession}
                    className="w-full py-3 bg-gradient-to-r from-[#00E5FF] to-[#00FFB3] hover:from-[#00B4D8] hover:to-[#00E5FF] text-[#050816] font-bold rounded-lg transition font-mono text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {launchingSession ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#050816] border-t-transparent"></div>
                        Initializing Sandboxes...
                      </>
                    ) : (
                      <>
                        Deploy War Room Sandbox <Play size={12} fill="currentColor" />
                      </>
                    )}
                  </button>
                </Card>
              ) : (
                <Card className="p-5 border-white/10 bg-black/40 text-center py-12 space-y-4">
                  <div className="mx-auto rounded-full bg-white/5 border border-white/10 w-12 h-12 flex items-center justify-center text-zinc-400">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Select Outage Incident</h3>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                      Choose any incident from the grid on the left to review metrics and initialize your active troubleshooting room.
                    </p>
                  </div>
                </Card>
              )}

              {/* PAST SESSIONS / HISTORY */}
              <Card className="p-5 border-white/10 bg-black/40">
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History size={16} className="text-zinc-500" /> Triage History Log
                </h3>

                {sessionsLoading ? (
                  <p className="text-xs text-zinc-500 font-mono italic">Loading triage history...</p>
                ) : pastSessions.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono italic">No past incidents completed yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {pastSessions.map((session) => (
                      <div 
                        key={session.id} 
                        className="rounded-lg bg-white/[0.01] border border-white/5 p-3 flex justify-between items-center text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white truncate max-w-[150px]">{session.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {session.role} · {formatDuration(session.timeElapsed)}
                          </p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            {session.status === "RESOLVED" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-mono">
                                <CheckCircle size={10} /> Graded: {session.score}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono">
                                <XCircle size={10} /> Failed
                              </span>
                            )}
                          </div>
                          
                          <Link 
                            href={`/troubleshooting?sessionSummaryId=${session.id}`}
                            className="text-[11px] font-mono text-[#00E5FF] hover:underline"
                          >
                            View RCA
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TroubleshootingQueuePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
        <p className="mt-4 text-zinc-400 font-mono">Loading GuruAI Outages queue...</p>
      </div>
    }>
      <TroubleshootingQueueContent />
    </Suspense>
  );
}
