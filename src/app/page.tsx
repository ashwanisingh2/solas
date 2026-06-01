"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const AiBrainScene = dynamic(() => import("@/components/three/ai-brain").then((mod) => mod.AiBrainScene), { ssr: false });
export default function LandingPage() {
  return (
    <section className="relative grid min-h-[92vh] place-items-center overflow-hidden">
      <div className="neural-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-10 mx-auto h-80 max-w-5xl rounded-full bg-[#00E5FF]/10 blur-3xl" />
      <div className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 18 }} className="space-y-6">
          <p className="text-sm uppercase tracking-widest text-[#00FFB3]">GuruAI Operating System</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
            Your Personal <span className="aurora-text">AI Engineering Mentor</span>
          </h1>
          <p className="max-w-xl text-xl text-zinc-300">Learn. Practice. Build. Get Hired.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding"><Button>Start Learning</Button></Link>
            <Link href="/dashboard" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-100 backdrop-blur transition hover:border-[#00E5FF]/50">Watch Demo</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <AiBrainScene />
        </motion.div>
      </div>
    </section>
  );
}
