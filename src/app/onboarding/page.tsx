"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
export default function OnboardingPage() {
  const [name, setName] = useState(""); const r = useRouter(); const setUserId = useAppStore((s) => s.setUserId);
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-12">
      <p className="text-sm uppercase tracking-widest text-emerald-300">Engineer intake</p>
      <h2 className="text-3xl font-semibold">Build your operating profile</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-3"/>
      <select className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-3" defaultValue="IT Support Engineer">
        <option>Desktop Support Engineer</option>
        <option>IT Support Engineer</option>
        <option>System Administrator</option>
        <option>Network Engineer</option>
        <option>Cloud Engineer</option>
        <option>DevOps Engineer</option>
      </select>
      <Button onClick={() => { setUserId(name || "demo-user"); r.push("/dashboard"); }}>Create Profile</Button>
    </div>
  );
}
