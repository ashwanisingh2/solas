import { PrismaClient, Track, LabDomain, IncidentDomain } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.skill.createMany({
    skipDuplicates: true,
    data: [
      { id: "windows-ad-basics", title: "Active Directory fundamentals", domain: "windows", track: Track.SYSTEM_ADMINISTRATION, level: 1, description: "Users, groups, OUs, authentication, and basic domain operations." },
      { id: "windows-dns-dhcp", title: "DNS and DHCP operations", domain: "windows", track: Track.IT_SUPPORT, level: 1, description: "Name resolution, leases, scopes, reservations, and incident triage." },
      { id: "linux-admin", title: "Linux administration", domain: "linux", track: Track.SYSTEM_ENGINEERING, level: 1, description: "Users, permissions, services, logs, shell, and networking." },
      { id: "aws-foundations", title: "AWS foundations", domain: "cloud", track: Track.CLOUD_ENGINEERING, level: 2, description: "IAM, VPC, EC2, S3, billing safety, and operational checks." },
      { id: "docker-k8s", title: "Docker and Kubernetes operations", domain: "devops", track: Track.DEVOPS_ENGINEERING, level: 3, description: "Containers, images, deployments, services, probes, and rollout repair." },
    ],
  });

  await prisma.lab.createMany({
    skipDuplicates: true,
    data: [
      { id: "lab-ad-user-onboarding", domain: LabDomain.WINDOWS, title: "Onboard a new employee in AD", topic: "Active Directory", difficulty: 2, objective: "Create user, assign groups, validate login path, and document access.", validation: { checks: ["user_created", "groups_assigned", "ticket_note"] } },
      { id: "lab-linux-service-repair", domain: LabDomain.LINUX, title: "Repair a failed Linux service", topic: "Services", difficulty: 2, objective: "Read logs, restart service safely, persist configuration, and record RCA.", validation: { checks: ["journal_reviewed", "service_active", "rca_written"] } },
      { id: "lab-aws-vpc-ec2", domain: LabDomain.CLOUD, title: "Launch secure EC2 in a VPC", topic: "AWS", difficulty: 3, objective: "Create network path, restrict ingress, deploy EC2, and prove SSH access.", validation: { checks: ["vpc_ready", "sg_restricted", "ssh_verified"] } },
      { id: "lab-docker-ci", domain: LabDomain.DEVOPS, title: "Containerize and ship an app", topic: "Docker", difficulty: 3, objective: "Build image, run locally, push through CI, and verify health.", validation: { checks: ["image_builds", "container_healthy", "pipeline_green"] } },
    ],
  });

  await prisma.incidentTemplate.createMany({
    skipDuplicates: true,
    data: [
      { id: "inc-dns-internal-tools", domain: IncidentDomain.DNS, title: "Internal tools fail by hostname", symptoms: "User can ping public IPs but internal hostnames do not resolve.", expectedRca: "Broken DNS resolver path or stale resolver cache.", proofSteps: ["ipconfig /all", "nslookup internal host", "flush resolver cache"], difficulty: 2 },
      { id: "inc-vpn-connectivity", domain: IncidentDomain.VPN, title: "VPN connects but apps fail", symptoms: "VPN status is connected, but file share and intranet are unreachable.", expectedRca: "Split tunnel, route, DNS, or firewall policy mismatch.", proofSteps: ["route print", "nslookup", "tracert", "policy check"], difficulty: 3 },
      { id: "inc-ad-login", domain: IncidentDomain.ACTIVE_DIRECTORY, title: "Domain login failure", symptoms: "User password works in portal but workstation login fails.", expectedRca: "Domain trust, cached credential, replication, or account lockout.", proofSteps: ["lockout status", "dc reachability", "event logs"], difficulty: 3 },
    ],
  });

  await prisma.companyEnvironment.upsert({
    where: { id: "company-100-user-core" },
    update: {},
    create: {
      id: "company-100-user-core",
      name: "100 User Hybrid Company",
      usersCount: 100,
      systems: { activeDirectory: true, fileServer: true, printServer: true, monitoring: true },
      network: { vpn: true, firewall: true, vlans: ["users", "servers", "guest"] },
      cloud: { aws: true, azureIam: true, s3: true },
      security: { mfa: true, leastPrivilege: true, auditLogging: true },
    },
  });

  await prisma.projectTemplate.createMany({
    skipDuplicates: true,
    data: [
      { id: "project-ad-core", title: "Build Active Directory core", track: Track.SYSTEM_ADMINISTRATION, objective: "Design OU structure, users, groups, DNS, DHCP, and policy baseline.", milestones: ["domain_design", "identity_setup", "policy_validation"], rubric: { passScore: 85 } },
      { id: "project-aws-env", title: "Build AWS support environment", track: Track.CLOUD_ENGINEERING, objective: "Deploy secure VPC, EC2, S3, IAM roles, and monitoring baseline.", milestones: ["network", "compute", "storage", "observability"], rubric: { passScore: 85 } },
      { id: "project-cicd", title: "Build CI/CD pipeline", track: Track.DEVOPS_ENGINEERING, objective: "Create Git workflow, Docker image, Jenkins pipeline, and deployment checks.", milestones: ["repo", "image", "pipeline", "monitoring"], rubric: { passScore: 85 } },
    ],
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
