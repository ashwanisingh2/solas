import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/phase-a/stat";
import { calculateReadiness, skillGraph, weakestSkills } from "@/lib/phase-a-data";

export default function AnalyticsPage() {
  const readiness = calculateReadiness();
  const weak = weakestSkills();
  const openSkills = skillGraph.filter((skill) => !skill.locked).length;

  return (
    <div>
      <Nav />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest text-emerald-300">Learning Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold">Readiness telemetry</h1>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Job readiness" value={`${readiness}%`} helper="Weighted mastery + confidence" />
        <Stat label="Open skills" value={`${openSkills}/${skillGraph.length}`} helper="Unlocked learning surface" />
        <Stat label="Critical gap" value={weak[0].title} helper={`${weak[0].mastery}% mastery`} />
      </div>
      <Card className="mt-6 rounded-lg border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-xl font-semibold">Gap report</h2>
        <div className="mt-4 space-y-3">
          {weak.map((skill) => (
            <div key={skill.id} className="grid gap-2 rounded-md border border-zinc-900 p-3 md:grid-cols-[1fr_120px] md:items-center">
              <div>
                <p className="text-sm font-medium">{skill.title}</p>
                <p className="text-xs text-zinc-500">{skill.evidence}</p>
              </div>
              <p className="text-sm text-zinc-400">{skill.mastery}% mastery</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
