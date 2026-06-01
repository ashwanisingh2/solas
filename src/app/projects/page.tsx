import { OsModulePage } from "@/components/phase-a/os-module-page";
import { projectCatalog } from "@/lib/os-catalog";

export default function ProjectsPage() {
  return (
    <OsModulePage
      eyebrow="Project Engine"
      title="Production projects"
      description="Automatically generated projects that create portfolio evidence for real IT engineering roles."
      items={projectCatalog.map((project) => ({ title: project.title, meta: "Portfolio evidence", detail: project.outcome }))}
    />
  );
}
