import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { dailyMission, skillGraph } from "@/lib/phase-a-data";

export default function LearningPage() {
  return (
    <div>
      <Nav />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest text-emerald-300">Adaptive Learning Engine</p>
        <h1 className="mt-2 text-3xl font-semibold">Next best action</h1>
      </div>
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="rounded-lg border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">{dailyMission.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{dailyMission.scenario}</p>
          <div className="mt-5 space-y-3">
            {dailyMission.blocks.map((block, index) => (
              <div key={block.label} className="flex items-center justify-between rounded-md border border-zinc-900 p-3">
                <div>
                  <p className="text-sm font-medium">{index + 1}. {block.label}</p>
                  <p className="text-xs text-zinc-500">{block.focus}</p>
                </div>
                <p className="text-sm text-zinc-400">{block.minutes}m</p>
              </div>
            ))}
          </div>
          <Link href="/practice" className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-300">Continue to practice <ArrowRight size={16} /></Link>
        </Card>

        <Card className="rounded-lg border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Unlock map</h2>
          <div className="mt-4 space-y-3">
            {skillGraph.map((skill) => (
              <div key={skill.id} className="rounded-md border border-zinc-900 p-3">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-medium">{skill.title}</p>
                  <p className={skill.locked ? "text-sm text-red-300" : "text-sm text-emerald-300"}>{skill.locked ? "Locked" : "Open"}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{skill.evidence}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
