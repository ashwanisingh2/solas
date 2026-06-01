import { AlertTriangle, Building2 } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { companySimulation } from "@/lib/os-catalog";

const departments = ["IT", "HR", "Finance", "Cloud", "Security"];

export default function CompanyPage() {
  return (
    <div>
      <Nav />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest text-[#00FFB3]">Company Simulation</p>
        <h1 className="mt-2 text-4xl font-semibold">{companySimulation.name}</h1>
      </div>
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative min-h-[520px] overflow-hidden p-6">
          <div className="neural-grid absolute inset-0 opacity-50" />
          <div className="relative grid h-full place-items-center">
            <div className="relative h-80 w-80">
              <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 shadow-[0_0_60px_rgba(0,229,255,.25)]">
                <Building2 className="text-[#00E5FF]" />
              </div>
              {departments.map((department, index) => {
                const angle = (index / departments.length) * Math.PI * 2;
                const x = Math.cos(angle) * 135;
                const y = Math.sin(angle) * 135;
                return (
                  <div key={department} className="absolute grid h-24 w-24 place-items-center rounded-2xl border border-white/10 bg-black/35 text-sm text-zinc-200 backdrop-blur-xl" style={{ left: `calc(50% + ${x}px - 48px)`, top: `calc(50% + ${y}px - 48px)` }}>
                    {department}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <AlertTriangle className="text-[#FF4D6D]" />
            <h2 className="mt-3 text-xl font-semibold">Live incident</h2>
            <p className="mt-2 text-sm text-zinc-400">{companySimulation.currentIncident}</p>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Engineer objective</h2>
            <p className="mt-2 text-sm text-zinc-400">{companySimulation.engineerGoal}</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
