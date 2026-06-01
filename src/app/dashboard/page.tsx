/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { ArrowRight, RadioTower, Flame, Bell, Trophy, Award, BarChart3 } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/phase-a/stat";
import { SkillRow } from "@/components/phase-a/skill-row";
import { calculateReadiness, dailyMission, learnerProfile, skillGraph, weakestSkills } from "@/lib/phase-a-data";
import { MotionShell } from "@/components/design/motion-shell";
import dynamic from "next/dynamic";

const SkillGalaxyScene = dynamic(() => import("@/components/three/skill-galaxy").then((mod) => mod.SkillGalaxyScene), { ssr: false });

export default function DashboardPage() {
  const readiness = calculateReadiness();
  const weakest = weakestSkills()[0];

  // Peer Leaderboard mock data
  const leaderboard = [
    { rank: 1, name: "Kabir Sharma", xp: 4850, track: "DevOps" },
    { rank: 2, name: "Divya Nair", xp: 4200, track: "Cloud" },
    { rank: 3, name: "Rohan Das", xp: 3950, track: "Security" },
    { rank: 4, name: "Aarav Patel (You)", xp: 3410, track: "IT Support", active: true },
    { rank: 5, name: "Priya Rao", xp: 3100, track: "Systems" },
  ];

  // Badges mock data
  const badges = [
    { id: "b1", title: "DNS Sentinel", description: "Successfully resolved 1st DNS incident", unlocked: true },
    { id: "b2", title: "Integrity Shield", description: "Completed baseline assessment with 0 tab switches", unlocked: true },
    { id: "b3", title: "Docker Captain", description: "Completed 5 container drills", unlocked: false },
    { id: "b4", title: "Cloud Guardian", description: "Fixed a VPC route table drift", unlocked: false },
  ];

  return (
    <MotionShell>
      <Nav />
      
      {/* 1. STREAK WARNING & STUDY REMINDER ALERTS */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-3">
            <Flame className="text-amber-500 animate-pulse shrink-0" size={24} />
            <div>
              <p className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">STREAK AT RISK</p>
              <p className="text-xs text-zinc-300 mt-0.5">Don&apos;t lose your 4-day streak! Complete today&apos;s mission in 5 hours.</p>
            </div>
          </div>
          <Link href="/practice">
            <button className="rounded-lg bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition cursor-pointer">
              Drill Now
            </button>
          </Link>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
          <Bell className="text-blue-400 shrink-0" size={22} />
          <div>
            <p className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">DAILY STUDY REMINDER</p>
            <p className="text-xs text-zinc-300 mt-0.5">Review your weakest skill: <b>{weakest.title}</b> before taking the next mastery test.</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-[#00FFB3]">{learnerProfile.targetRole}</p>
            <h1 className="mt-2 text-4xl font-semibold text-zinc-55 md:text-5xl">Engineer command center</h1>
            <p className="mt-2 max-w-2xl text-zinc-450 text-sm">Your next actions are generated from current mastery, weak areas, and job readiness evidence.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Readiness" value={`${readiness}%`} helper="Role-fit score" />
            <Stat label="Streak" value={`${learnerProfile.streak} days`} helper="Active learning habit" />
            <Stat label="Weekly load" value={`${learnerProfile.weeklyHours}h`} helper="Planned effort" />
          </div>

          {/* Today Mission Card */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-[#00E5FF]">Today mission</p>
                <h2 className="mt-2 text-xl font-semibold">{dailyMission.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{dailyMission.scenario}</p>
              </div>
              <RadioTower className="mt-1 text-[#00E5FF] shrink-0" size={22} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {dailyMission.blocks.map((block) => (
                <div key={block.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-sm font-medium">{block.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{block.minutes} min · {block.focus}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. DOWNTIME / STUDY TIME BAR CHART */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="text-[#00E5FF]" size={18} /> Daily Study Analytics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-end h-28 pt-2">
                {[
                  { day: "Mon", min: 45 },
                  { day: "Tue", min: 60 },
                  { day: "Wed", min: 30 },
                  { day: "Thu", min: 45 },
                  { day: "Fri", min: 12 },
                  { day: "Sat", min: 0 },
                  { day: "Sun", min: 0 },
                ].map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">{d.min}m</span>
                    <div 
                      className={`w-8 rounded-t-md transition-all ${
                        d.min > 0 
                          ? "bg-gradient-to-t from-[#00E5FF]/20 to-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
                          : "bg-white/5 h-2"
                      }`}
                      style={{ height: d.min > 0 ? `${(d.min / 60) * 80}px` : "8px" }}
                    />
                    <span className="text-[10px] font-mono text-zinc-400">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Skill graph</h2>
            <div className="mt-2">{skillGraph.map((skill) => <SkillRow key={skill.id} skill={skill} />)}</div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="overflow-hidden p-0">
            <SkillGalaxyScene />
          </Card>

          {/* 3. PEER LEADERBOARD & XP SYSTEM */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <Trophy className="text-[#00FFB3]" size={18} /> Peer Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.map((item) => (
                <div 
                  key={item.rank} 
                  className={`flex justify-between items-center rounded-lg p-2 text-xs font-mono border ${
                    item.active 
                      ? "border-[#00E5FF]/30 bg-[#00E5FF]/5 text-white font-bold" 
                      : "border-transparent bg-white/[0.01] text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={item.rank === 1 ? "text-amber-400" : item.rank === 2 ? "text-zinc-300" : "text-zinc-500"}>
                      #{item.rank}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-500">[{item.track}]</span>
                    <span className="text-[#00FFB3]">{item.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. BADGES & ACHIEVEMENTS */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
              <Award className="text-purple-400" size={18} /> Badges & Achievements
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`rounded-lg border p-3 text-left transition select-none flex flex-col justify-between ${
                    badge.unlocked 
                      ? "border-purple-500/20 bg-purple-500/5 text-purple-300" 
                      : "border-white/5 bg-black/20 text-zinc-600 opacity-60"
                  }`}
                >
                  <Award size={20} className={badge.unlocked ? "text-purple-400" : "text-zinc-700"} />
                  <div className="mt-2.5">
                    <p className="text-xs font-bold truncate leading-none">{badge.title}</p>
                    <p className="text-[9px] text-zinc-500 leading-normal mt-1">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm uppercase tracking-widest text-[#FF4D6D]">Weakest signal</p>
            <h2 className="mt-2 text-xl font-semibold">{weakest.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{weakest.evidence}</p>
            <Link href="/teacher" className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-300">
              Start AI lesson <ArrowRight size={16} />
            </Link>
          </Card>
        </aside>
      </section>
    </MotionShell>
  );
}
