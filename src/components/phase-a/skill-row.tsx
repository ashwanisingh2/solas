import { Lock, Unlock } from "lucide-react";
import type { SkillNode } from "@/lib/phase-a-data";

export function SkillRow({ skill }: { skill: SkillNode }) {
  return (
    <div className="grid gap-3 border-b border-zinc-900 py-4 last:border-0 md:grid-cols-[1fr_140px_140px_32px] md:items-center">
      <div>
        <p className="font-medium text-zinc-100">{skill.title}</p>
        <p className="mt-1 text-sm text-zinc-500">{skill.evidence}</p>
      </div>
      <Meter label="Mastery" value={skill.mastery} />
      <Meter label="Confidence" value={skill.confidence} />
      <div className="text-zinc-500">{skill.locked ? <Lock size={18} /> : <Unlock size={18} />}</div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded bg-zinc-900">
        <div className="h-2 rounded bg-emerald-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
