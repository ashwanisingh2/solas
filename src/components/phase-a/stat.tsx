import { Card } from "@/components/ui/card";

type StatProps = {
  label: string;
  value: string;
  helper: string;
};

export function Stat({ label, value, helper }: StatProps) {
  return (
    <Card className="rounded-lg border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{helper}</p>
    </Card>
  );
}
