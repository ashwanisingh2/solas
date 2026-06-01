"use client";
import dynamic from "next/dynamic";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";

const SkillGalaxyScene = dynamic(() => import("@/components/three/skill-galaxy").then((mod) => mod.SkillGalaxyScene), { ssr: false });

export default function SkillGalaxyPage() {
  return (
    <div>
      <Nav />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest text-[#00FFB3]">Skill Galaxy</p>
        <h1 className="mt-2 text-4xl font-semibold">Skills as planets. Mastery as gravity.</h1>
      </div>
      <Card className="overflow-hidden p-0">
        <SkillGalaxyScene />
      </Card>
    </div>
  );
}
