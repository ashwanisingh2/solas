import { OsModulePage } from "@/components/phase-a/os-module-page";
import { adminControls } from "@/lib/os-catalog";

export default function AdminPage() {
  return (
    <OsModulePage
      eyebrow="Admin Portal"
      title="Platform operations"
      description="Role-gated administration for users, labs, AI models, content, analytics, and revenue operations."
      items={adminControls.map((control) => ({ title: control, meta: "Admin control", detail: `Manage ${control.toLowerCase()} with audit-ready operations and RBAC.` }))}
    />
  );
}
