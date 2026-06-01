import { Bot, Terminal } from "lucide-react";
import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";
import { labCatalog } from "@/lib/os-catalog";

export default function LabsPage() {
  const active = labCatalog[0];
  return (
    <div>
      <Nav />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest text-[#00FFB3]">Practical Labs</p>
        <h1 className="mt-2 text-4xl font-semibold">Cyber lab console</h1>
      </div>
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.35fr_0.8fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">{active.domain}</h2>
          <div className="mt-4 space-y-2">
            {active.topics.map((topic) => (
              <div key={topic} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">{topic}</div>
            ))}
          </div>
        </Card>
        <Card className="min-h-[460px] overflow-hidden p-0">
          <div className="border-b border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-[#00FFB3]">
            guruai-lab://windows/ad-dns-dhcp
          </div>
          <div className="p-5 font-mono text-sm leading-7 text-zinc-300">
            <p className="text-[#00E5FF]">$ lab start active-directory-core</p>
            <p>Provisioning domain controller...</p>
            <p>Creating DNS zone...</p>
            <p>Validating DHCP lease scope...</p>
            <p className="text-[#00FFB3]">STATUS: ready for engineer task</p>
            <div className="mt-6 rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/5 p-4">
              <Terminal className="mb-3 text-[#00E5FF]" />
              Create a user, assign group policy, validate DNS, and write the ticket note.
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <Bot className="text-[#00E5FF]" />
          <h2 className="mt-3 text-lg font-semibold">AI Lab Instructor</h2>
          <p className="mt-2 text-sm text-zinc-400">I will verify commands, evidence, and your RCA before marking this lab complete.</p>
        </Card>
      </section>
    </div>
  );
}
