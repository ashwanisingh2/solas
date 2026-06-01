export const labCatalog = [
  { domain: "Windows Lab", topics: ["Active Directory", "DNS", "DHCP", "GPO", "File Server", "Print Server"], recommended: "Active Directory" },
  { domain: "Linux Lab", topics: ["Linux Admin", "Shell", "Users", "Services", "Networking"], recommended: "Services" },
  { domain: "Cloud Lab", topics: ["AWS", "Azure", "IAM", "VPC", "EC2", "S3"], recommended: "IAM" },
  { domain: "DevOps Lab", topics: ["Git", "Docker", "Kubernetes", "Terraform", "Jenkins", "Monitoring"], recommended: "Docker" },
];

export const incidents = [
  { type: "DNS Issue", symptom: "Internal tools fail by hostname while public IP ping works.", severity: "P2", proof: "nslookup, resolver config, cache state" },
  { type: "VPN Issue", symptom: "VPN connects but file share and intranet are unreachable.", severity: "P2", proof: "routes, DNS suffix, firewall policy" },
  { type: "AD Issue", symptom: "Domain login fails after password reset.", severity: "P1", proof: "lockout status, DC reachability, event logs" },
  { type: "Cloud Issue", symptom: "EC2 app responds internally but not publicly.", severity: "P2", proof: "security group, NACL, route table, health check" },
];

export const companySimulation = {
  name: "100 User Hybrid Company",
  estate: ["Active Directory", "File Server", "AWS", "VPN", "Firewall"],
  currentIncident: "Remote finance team cannot access file share over VPN.",
  engineerGoal: "Prove whether the fault is identity, route, DNS, or firewall policy.",
};

export const projectCatalog = [
  { title: "Build Active Directory", outcome: "OU model, users, groups, GPO baseline, DNS/DHCP validation" },
  { title: "Build Enterprise Network", outcome: "VLANs, firewall zones, VPN path, monitoring checks" },
  { title: "Build AWS Environment", outcome: "IAM, VPC, EC2, S3, least privilege, cost guardrails" },
  { title: "Build CI/CD Pipeline", outcome: "Git workflow, Docker image, Jenkins pipeline, rollout checks" },
  { title: "Build Monitoring System", outcome: "Metrics, logs, alerts, incident runbook" },
];

export const interviewRounds = [
  { type: "Technical Interview", focus: "DNS, DHCP, AD, Linux services, cloud fundamentals" },
  { type: "HR Interview", focus: "Communication, ownership, incident pressure, teamwork" },
  { type: "Scenario Interview", focus: "Real incident diagnosis and structured RCA" },
  { type: "Voice Interview", focus: "Clear spoken explanation and confidence" },
];

export const careerTools = [
  { title: "Resume Builder", metric: "ATS-ready engineer resume" },
  { title: "ATS Score", metric: "Keyword and evidence coverage" },
  { title: "LinkedIn Optimizer", metric: "Profile headline, proof projects, role alignment" },
  { title: "Skill Gap Analysis", metric: "Readiness delta by target role" },
];

export const adminControls = [
  "Users",
  "Labs",
  "AI Models",
  "Content",
  "Analytics",
  "Revenue",
];
