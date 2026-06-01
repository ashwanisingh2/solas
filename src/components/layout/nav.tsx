"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BookOpenCheck, Brain, BriefcaseBusiness, Building2, ClipboardCheck, Dumbbell, Gauge, Hammer, Orbit, ShieldAlert, UserRoundCog } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/assessment", label: "Assessment", icon: ClipboardCheck },
  { href: "/teacher", label: "AI Teacher", icon: Brain },
  { href: "/learning", label: "Learning", icon: BookOpenCheck },
  { href: "/skill-galaxy", label: "Galaxy", icon: Orbit },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/labs", label: "Labs", icon: Hammer },
  { href: "/troubleshooting", label: "Incidents", icon: ShieldAlert },
  { href: "/company", label: "Company", icon: Building2 },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/interview", label: "Interview", icon: Activity },
  { href: "/career", label: "Career", icon: UserRoundCog },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: UserRoundCog },
];

export function Nav() {
  const p = usePathname();
  return (
    <nav className="glass sticky top-4 z-50 mb-6 flex flex-wrap gap-2 rounded-2xl px-3 py-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = p === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-[#00E5FF] text-[#050816] shadow-[0_0_24px_rgba(0,229,255,.28)]" : "text-zinc-300 hover:bg-white/10"
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
