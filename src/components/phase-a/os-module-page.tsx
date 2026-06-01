import { Nav } from "@/components/layout/nav";
import { Card } from "@/components/ui/card";

type OsModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: { title: string; meta: string; detail: string }[];
};

export function OsModulePage({ eyebrow, title, description, items }: OsModulePageProps) {
  return (
    <div>
      <Nav />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-widest text-emerald-300">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-3xl text-zinc-400">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="rounded-lg border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{item.meta}</p>
            <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
