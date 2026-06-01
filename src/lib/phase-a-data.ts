export type EngineerRole =
  | "Desktop Support Engineer"
  | "IT Support Engineer"
  | "System Administrator"
  | "Network Engineer"
  | "Cloud Engineer"
  | "DevOps Engineer";

export type SkillNode = {
  id: string;
  title: string;
  domain: "support" | "systems" | "networking" | "cloud" | "devops" | "security";
  mastery: number;
  confidence: number;
  evidence: string;
  locked: boolean;
};

export type PracticeTask = {
  id: string;
  title: string;
  mode: "diagnose" | "configure" | "explain" | "debug";
  difficulty: "foundation" | "job-ready" | "advanced";
  prompt: string;
};

export const learnerProfile = {
  name: "Aarav",
  targetRole: "IT Support Engineer" as EngineerRole,
  readiness: 64,
  streak: 4,
  weeklyHours: 8,
  nextMilestone: "Resolve a DNS outage ticket end-to-end",
};

export const skillGraph: SkillNode[] = [
  {
    id: "windows-triage",
    title: "Windows endpoint triage",
    domain: "support",
    mastery: 78,
    confidence: 71,
    evidence: "Closed password reset and boot issue drills",
    locked: false,
  },
  {
    id: "linux-cli",
    title: "Linux command line operations",
    domain: "systems",
    mastery: 54,
    confidence: 49,
    evidence: "Needs stronger file permission practice",
    locked: false,
  },
  {
    id: "dns-dhcp",
    title: "DNS and DHCP troubleshooting",
    domain: "networking",
    mastery: 42,
    confidence: 38,
    evidence: "Missed root cause in name resolution incident",
    locked: false,
  },
  {
    id: "azure-iam",
    title: "Azure identity basics",
    domain: "cloud",
    mastery: 24,
    confidence: 31,
    evidence: "Locked until networking fundamentals reach 70%",
    locked: true,
  },
  {
    id: "git-ci",
    title: "Git and CI workflow",
    domain: "devops",
    mastery: 18,
    confidence: 22,
    evidence: "Locked until Linux operations reach 70%",
    locked: true,
  },
];

export const dailyMission = {
  title: "DNS outage desk ticket",
  scenario:
    "A user can reach 8.8.8.8 but cannot open internal tools by hostname. Identify the likely layer, validate with commands, and write the fix note.",
  blocks: [
    { label: "AI Teacher", minutes: 12, focus: "Name resolution mental model" },
    { label: "Practice", minutes: 18, focus: "nslookup, ipconfig, resolver cache" },
    { label: "Lab", minutes: 25, focus: "Reproduce and repair broken DNS" },
  ],
};

export const practiceTasks: PracticeTask[] = [
  {
    id: "dns-ticket-1",
    title: "Classify a DNS failure",
    mode: "diagnose",
    difficulty: "foundation",
    prompt: "User can ping an IP but not the hostname. What do you check first?",
  },
  {
    id: "linux-perms-1",
    title: "Repair script permission",
    mode: "configure",
    difficulty: "job-ready",
    prompt: "A deployment script returns permission denied. Explain the minimum safe fix.",
  },
  {
    id: "windows-boot-1",
    title: "Boot issue handoff",
    mode: "explain",
    difficulty: "job-ready",
    prompt: "Write a ticket update after isolating a startup repair loop.",
  },
];

export const assessmentQuestions = [
  {
    id: "q1",
    skillId: "dns-dhcp",
    question: "A device has IP 169.254.x.x. Which service is most likely failing?",
    options: ["DHCP", "DNS", "NTP", "LDAP"],
    answer: "DHCP",
  },
  {
    id: "q2",
    skillId: "linux-cli",
    question: "Which command shows current directory permissions?",
    options: ["ls -la", "pwd -a", "chmod -r", "whoami --dir"],
    answer: "ls -la",
  },
  {
    id: "q3",
    skillId: "windows-triage",
    question: "Which Windows tool is best for reviewing application crash logs?",
    options: ["Event Viewer", "Task Manager", "Paint", "Disk Cleanup"],
    answer: "Event Viewer",
  },
];

export function calculateReadiness() {
  const unlocked = skillGraph.filter((skill) => !skill.locked);
  const mastery = unlocked.reduce((sum, skill) => sum + skill.mastery, 0) / unlocked.length;
  const confidence = unlocked.reduce((sum, skill) => sum + skill.confidence, 0) / unlocked.length;
  return Math.round(mastery * 0.7 + confidence * 0.3);
}

export function weakestSkills() {
  return [...skillGraph].filter((skill) => !skill.locked).sort((a, b) => a.mastery - b.mastery);
}
