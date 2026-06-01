export type IncidentDomain = "WINDOWS" | "NETWORK" | "CLOUD" | "DEVOPS" | "SECURITY";

export interface Alert {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  service: string;
  message: string;
  timestamp: string;
}

export interface MetricDataPoint {
  time: string;
  cpu: number;
  memory: number;
  network: number; // MB/s
  errorRate: number; // %
  latency: number; // ms
}

export interface MockCommand {
  command: string;
  output: string;
}

export interface IncidentTemplate {
  id: string;
  domain: IncidentDomain;
  title: string;
  severity: "P1" | "P2" | "P3";
  role: string;
  symptoms: string;
  businessImpact: {
    description: string;
    financialLossPerMinute: number;
    affectedUsers: number;
    riskLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  };
  expectedRca: string;
  remediationOptions: {
    id: string;
    label: string;
    description: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  preventiveActionOptions: string[];
  userComplaints: string[];
  liveAlerts: Alert[];
  initialMetrics: MetricDataPoint[];
  resolvedMetrics: MetricDataPoint[];
  systemLogs: string[];
  commands: Record<string, string>;
}

export const incidentCatalog: IncidentTemplate[] = [
  // ==================== WINDOWS INCIDENTS ====================
  {
    id: "win-dc-down",
    domain: "WINDOWS",
    title: "Domain Controller Down",
    severity: "P1",
    role: "System Engineer",
    symptoms: "Workstation login fails. Active Directory administration tools cannot contact the domain controller. File shares are inaccessible.",
    businessImpact: {
      description: "Company-wide authentication outage. 100+ office workers unable to sign in or access internal resources.",
      financialLossPerMinute: 850,
      affectedUsers: 100,
      riskLevel: "CRITICAL",
    },
    expectedRca: "Primary Domain Controller (DC-01) VM crashed due to local storage exhaustion (0% disk space) on the host hypervisor, locking the database (ntds.dit).",
    remediationOptions: [
      {
        id: "restart-dc",
        label: "Restart DC-01 VM",
        description: "Force restart the Domain Controller VM via hypervisor console.",
        isCorrect: false,
        feedback: "The VM attempts to boot but fails immediately because the hypervisor datastore has no free space to write the virtual memory paging (.vswp) file.",
      },
      {
        id: "extend-disk-cleanup",
        label: "Clear host hypervisor disk space and reboot DC-01",
        description: "Delete obsolete VM snapshots on the hypervisor host to free disk space, then boot DC-01.",
        isCorrect: true,
        feedback: "Correct! Freeing 450GB of host disk space allowed DC-01 to boot successfully, mount its virtual disks, and launch AD Services (ntds.dit).",
      },
      {
        id: "reset-ad-password",
        label: "Reset Administrator password",
        description: "Attempt to reset the domain administrator password in DSRM.",
        isCorrect: false,
        feedback: "DSRM is reachable, but resetting passwords does not resolve the host disk space outage. Workstations still cannot contact the DC.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure PRTG/Zabbix disk space alarms on hypervisor datastores", isCorrect: true },
      { text: "Enable automatic snapshot deletion policies for hypervisors", isCorrect: true },
      { text: "Replicate AD to a secondary Domain Controller (DC-02) on a different host", isCorrect: true },
      { text: "Reinstall Active Directory from scratch", isCorrect: false },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I'm locked out of my computer! It says 'No logon servers available to service the request'. Urgent!",
      "I cannot access the G: Drive (finance records). It's asking for credentials and then failing.",
      "Cannot log in. HR onboarding is stuck, new hires are sitting idle.",
    ],
    liveAlerts: [
      { id: "al-1", severity: "CRITICAL", service: "Active Directory", message: "Domain Controller DC-01 is unreachable / Ping Failed", timestamp: "0m ago" },
      { id: "al-2", severity: "CRITICAL", service: "Hypervisor", message: "Datastore 'DS-SAN-01' storage capacity at 100% usage", timestamp: "1m ago" },
      { id: "al-3", severity: "WARNING", service: "LDAP", message: "LDAP Bind Timeout for service accounts", timestamp: "2m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: i < 3 ? 45 : 0,
      memory: i < 3 ? 82 : 0,
      network: i < 3 ? 12 : 0,
      errorRate: i < 3 ? 2 : 100,
      latency: i < 3 ? 45 : 9999,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 40 + Math.random() * 15,
      memory: 70 + Math.random() * 5,
      network: 15 + Math.random() * 8,
      errorRate: 0,
      latency: 12 + Math.random() * 8,
    })),
    systemLogs: [
      "[2026-06-01 16:40:01] [VM_MONITOR] ERROR: DC-01 reported power state: OFF",
      "[2026-06-01 16:40:03] [HYPERVISOR] CRITICAL: Operation 'PowerOnVM' failed for DC-01. Reason: Insufficient disk space on datastore 'DS-SAN-01'.",
      "[2026-06-01 16:41:00] [CLIENT_AUTH] failed to resolve DC locator SRV record: _ldap._tcp.dc._msdcs.guruai.local",
    ],
    commands: {
      "ping 10.10.10.10": "PING 10.10.10.10 (10.10.10.10) 56(84) bytes of data.\nFrom 10.10.10.254 icmp_seq=1 Destination Host Unreachable\n--- 10.10.10.10 ping statistics ---\n5 packets transmitted, 0 received, 100% packet loss",
      "nslookup guruai.local": "Server:  UnKnown\nAddress:  10.10.10.1\n\n*** UnKnown can't find guruai.local: No response from server",
      "df -h host-datastore": "Filesystem            Size  Used Avail Use% Mounted on\n/dev/mapper/san-ds01  2.0T  2.0T     0 100% /vmfs/volumes/DS-SAN-01",
      "dcdiag": "Directory Server Diagnosis\n\nPerforming initial setup:\n   [ERROR] Ldap connection failed with error 81.\n   The host 'DC-01' could not be resolved or is down.\n   Exiting tests.",
    },
  },
  {
    id: "win-dns-failure",
    domain: "WINDOWS",
    title: "DNS Name Resolution Outage",
    severity: "P2",
    role: "IT Support Engineer",
    symptoms: "Users cannot access internet sites or internal web portals. Pinging IP addresses works, but pinging hostnames fails.",
    businessImpact: {
      description: "Employees cannot connect to SaaS tools (Salesforce, Google Workspace) or local resources by name.",
      financialLossPerMinute: 320,
      affectedUsers: 100,
      riskLevel: "HIGH",
    },
    expectedRca: "The DNS Server service on the Domain Controller crashed because of a corrupted zone file journal (.dns.jnl) during a dynamic update stream.",
    remediationOptions: [
      {
        id: "flush-dns",
        label: "Flush workstation client DNS Cache",
        description: "Run ipconfig /flushdns on all employee computers.",
        isCorrect: false,
        feedback: "Flushing client cache does not fix the root issue. The authoritative DNS server itself is not responding to queries.",
      },
      {
        id: "restart-dns-service",
        label: "Clear corrupt journal and restart DNS Server service",
        description: "Delete the 'guruai.local.dns.jnl' file and restart the DNS Server service (dns.exe) on the DC.",
        isCorrect: true,
        feedback: "Correct! Deleting the corrupted journal allowed the DNS service to start successfully and read the primary zone database.",
      },
      {
        id: "change-dns-to-google",
        label: "Change domain network cards to Google DNS",
        description: "Configure all DHCP scopes to hand out 8.8.8.8 directly to endpoints.",
        isCorrect: false,
        feedback: "This partially restores internet access, but breaks Active Directory domain logons and internal domain controller locator SRV checks.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure secondary DNS replica servers", isCorrect: true },
      { text: "Enable DNS query log audits to detect corruption triggers", isCorrect: true },
      { text: "Deploy active DNS monitoring checks via NRPE or custom exporter", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I cannot load google.com or slack. Everything says 'DNS_PROBE_FINISHED_NXDOMAIN'.",
      "Pinging our file server 10.10.10.15 works, but typing '\\\\fileserver\\shares' fails.",
    ],
    liveAlerts: [
      { id: "al-dns-1", severity: "CRITICAL", service: "DNS Server", message: "DNS Server Service (dns.exe) is Stopped on DC-01", timestamp: "0m ago" },
      { id: "al-dns-2", severity: "CRITICAL", service: "Internal Resolvers", message: "Name resolution lookup timeouts detected on subnet 10.10.10.0/24", timestamp: "2m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 30,
      network: i < 3 ? 5 : 0.1,
      errorRate: i < 3 ? 1 : 98,
      latency: i < 3 ? 5 : 5000,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 35,
      network: 6,
      errorRate: 0,
      latency: 8,
    })),
    systemLogs: [
      "[2026-06-01 16:42:15] [EVENT_VIEWER] [SYSTEM] ERROR: DNS Server service terminated unexpectedly. Event ID 7034.",
      "[2026-06-01 16:42:20] [EVENT_VIEWER] [DNS] ERROR: DNS server was unable to parse database journal for zone 'guruai.local'. Reading file 'guruai.local.dns.jnl' failed at line 1402.",
    ],
    commands: {
      "nslookup google.com": "DNS request timed out.\n    timeout was 2 seconds.\n*** Request to UnKnown timed-out",
      "ping 8.8.8.8": "PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms\n--- 8.8.8.8 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss",
      "sc query dns": "SERVICE_NAME: dns\n        TYPE               : 10  WIN32_OWN_PROCESS\n        STATE              : 1  STOPPED\n        WIN32_EXIT_CODE    : 1067  (0x42b)\n        SERVICE_EXIT_CODE  : 0  (0x0)",
      "dir C:\\Windows\\System32\\dns": "Volume in drive C has no label.\n Directory of C:\\Windows\\System32\\dns\n\n06/01/2026  04:00 PM    <DIR>          .\n06/01/2026  04:00 PM    <DIR>          ..\n06/01/2026  03:50 PM            32,842 guruai.local.dns\n06/01/2026  04:12 PM             4,190 guruai.local.dns.jnl",
    },
  },
  {
    id: "win-dhcp-failure",
    domain: "WINDOWS",
    title: "DHCP Scope Exhaustion",
    severity: "P2",
    role: "System Engineer",
    symptoms: "New devices cannot connect to the Wi-Fi or office network. Existing devices work, but anyone rebooting or changing desks receives a 169.254.x.x IP address.",
    businessImpact: {
      description: "Inability of remote workers coming to the office to connect to the LAN. Disrupts physical office productivity.",
      financialLossPerMinute: 180,
      affectedUsers: 35,
      riskLevel: "MEDIUM",
    },
    expectedRca: "The DHCP server scope 'Office_LAN' (10.10.20.50-10.10.20.150) is 100% full because of a short lease time configuration combined with a temporary rush of guest mobile devices.",
    remediationOptions: [
      {
        id: "expand-dhcp-scope",
        label: "Expand Scope Range and decrease lease time",
        description: "Increase the address pool (e.g. 10.10.20.20 to 10.10.20.240) and set lease duration to 8 hours (down from 8 days).",
        isCorrect: true,
        feedback: "Correct! The expanded pool instantly made 100+ new leases available, and the shorter lease duration ensures guest devices release leases quickly.",
      },
      {
        id: "restart-dhcp-server",
        label: "Restart DHCP Server service",
        description: "Execute Net Stop DHCPServer && Net Start DHCPServer.",
        isCorrect: false,
        feedback: "The service restarts successfully, but all leases are stored in the database. Pushing restart does not release any leased addresses.",
      },
      {
        id: "set-static-ips",
        label: "Assign static IPs to all laptops",
        description: "Instruct users to configure their laptops with static IPv4 addresses in the 10.10.20.x range.",
        isCorrect: false,
        feedback: "This causes severe IP address conflicts, massive administrative overhead, and fails for users without admin credentials on their endpoints.",
      },
    ],
    preventiveActionOptions: [
      { text: "Implement DHCP Rogue Guard and MAC filtering", isCorrect: false },
      { text: "Configure a separate VLAN and DHCP scope for guest Wi-Fi networks", isCorrect: true },
      { text: "Enable DHCP failover / split-scopes for high availability", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I plugged into my office desk port but I have no internet access. My IP is 169.254.120.44.",
      "Just got to the office, cannot connect to the Wi-Fi. It's stuck on 'Obtaining IP address'.",
    ],
    liveAlerts: [
      { id: "al-dhcp-1", severity: "WARNING", service: "DHCP Server", message: "Scope 'Office_LAN' (10.10.20.0) address availability is 0%", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 8,
      memory: 24,
      network: 2,
      errorRate: i < 3 ? 0 : 50,
      latency: 5,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 24,
      network: 3,
      errorRate: 0,
      latency: 5,
    })),
    systemLogs: [
      "[2026-06-01 16:35:10] [DHCP] WARNING: Address scope 'Office_LAN' is full. No addresses available to lease to MAC 00:15:5D:01:AF:22.",
      "[2026-06-01 16:38:22] [DHCP] WARNING: DHCPDISCOVER from client 00:15:5D:08:CE:D1 failed. Address allocation database exhausted.",
    ],
    commands: {
      "ipconfig": "Ethernet adapter Ethernet0:\n   Connection-specific DNS Suffix  . :\n   IPv4 Address. . . . . . . . . . . : 169.254.120.44\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . :",
      "netsh dhcp server show scope": "Scope Address      Subnet Mask     State        Scope Name\n=============      ===========     =====        ==========\n10.10.20.0         255.255.255.0   Active       Office_LAN\n\nTotal Scopes: 1",
      "netsh dhcp server scope 10.10.20.0 show clients": "No clients listed or query completed.\nActive Leases: 101 / 101 Total Addresses Available. Utilization: 100%",
    },
  },
  {
    id: "win-gpo-issue",
    domain: "WINDOWS",
    title: "GPO Corrupted Sysvol Outage",
    severity: "P2",
    role: "System Engineer",
    symptoms: "Workstations are failing to apply domain security baselines. Drive maps, desktop wallpapers, and proxy configurations are missing. Windows event log shows SYSVOL path errors.",
    businessImpact: {
      description: "Temporary security policy gap. Security proxies and endpoint policies are un-applied, creating compliance violations.",
      financialLossPerMinute: 150,
      affectedUsers: 100,
      riskLevel: "MEDIUM",
    },
    expectedRca: "A dynamic file replication system (DFSR) collision corrupted the GPT.INI file in the Sysvol folder structure of the primary Domain Controller, breaking group policy validation.",
    remediationOptions: [
      {
        id: "rebuild-sysvol-gpt",
        label: "Restore GPT.ini and force DFSR sync",
        description: "Restore the SYSVOL GPO directory from a VM backup or manually recreate the broken gpt.ini file, then run dfstag to force replication.",
        isCorrect: true,
        feedback: "Correct! Restoring the GPT.ini file resolved the policy ID conflict, allowing client systems to validate GPO version numbers.",
      },
      {
        id: "gpupdate-force",
        label: "Run gpupdate /force on endpoints",
        description: "Instruct all users or execute remote scripts to run gpupdate /force on their workstations.",
        isCorrect: false,
        feedback: "Endpoints will attempt to read SYSVOL but continue to throw errors because the server-side GPT.ini configuration file is corrupt.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure active monitoring for DFSR synchronization backlogs", isCorrect: true },
      { text: "Implement read-only replication targets for SYSVOL shares", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "My mapped drives (H: and M:) are gone this afternoon.",
      "The secure corporate proxy setup isn't active on my browser, I can browse unrestricted sites. GPO issue?",
    ],
    liveAlerts: [
      { id: "al-gpo-1", severity: "CRITICAL", service: "Group Policy", message: "GPO SYSVOL Version Mismatch detected across DCs", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 18,
      memory: 40,
      network: 3,
      errorRate: i < 3 ? 0 : 35,
      latency: 10,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 40,
      network: 4,
      errorRate: 0,
      latency: 10,
    })),
    systemLogs: [
      "[2026-06-01 16:20:00] [DFSR] ERROR: DFSR failed to replicate SYSVOL due to shared access violation or file corruption on path \\\\guruai.local\\sysvol\\guruai.local\\Policies\\{31B2F340-016D-11D2-945F-00C04FB984F9}\\gpt.ini.",
      "[2026-06-01 16:21:40] [CLIENT_GPO] EventID 1058: Windows cannot access the file gpt.ini for GPO. Access is denied or corrupt.",
    ],
    commands: {
      "gpresult /h report.html": "ERROR: The Group Policy engine was unable to read GPO metadata. Sysvol policy version is corrupt.",
      "type \\\\guruai.local\\sysvol\\guruai.local\\Policies\\{31B2F340-016D-11D2-945F-00C04FB984F9}\\gpt.ini": "Error: File is blank or contains corrupted control characters.",
      "dfsradmin Connection /ShowConsumerBacklog": "Active Backlog: 21 files queued. Blocked file: {31B2F340-016D-11D2-945F-00C04FB984F9}/gpt.ini (Conflict state)",
    },
  },
  {
    id: "win-ad-replication",
    domain: "WINDOWS",
    title: "AD Replication Failure",
    severity: "P2",
    role: "System Engineer",
    symptoms: "Changes made on DC-01 (e.g. password resets, security groups) are not reflecting on DC-02. Users in branch offices fail to authenticate with their new credentials.",
    businessImpact: {
      description: "Stale identity state. Password resets don't take effect in branch offices, leading to double-outages and support tickets.",
      financialLossPerMinute: 220,
      affectedUsers: 50,
      riskLevel: "MEDIUM",
    },
    expectedRca: "Active Directory Replication is failing because the secure RPC network ports are blocked by a local Windows Defender Firewall policy change on DC-02.",
    remediationOptions: [
      {
        id: "allow-rpc-firewall",
        label: "Allow RPC AD replication traffic in firewall",
        description: "Enable the predefined 'Active Directory Domain Services' firewall rules on DC-02.",
        isCorrect: true,
        feedback: "Correct! Enabling AD replication rules unblocked TCP ports 135 and the dynamic RPC range, allowing the replication engine to sync immediately.",
      },
      {
        id: "reset-computer-account",
        label: "Reset Domain Controller computer account",
        description: "Re-add DC-02 to the domain to restore authentication trust.",
        isCorrect: false,
        feedback: "Resetting DC-02's computer account breaks AD secure channel completely and requires a full manual rebuild of DC-02.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure centralized GPO for Windows Defender Firewall to prevent local drifts", isCorrect: true },
      { text: "Monitor Event ID 1925 (Replication failure) on all DCs", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Help desk reset my password 20 minutes ago. It works when logging into Office 365, but my workstation at the regional office still says incorrect password.",
    ],
    liveAlerts: [
      { id: "al-ad-rep-1", severity: "WARNING", service: "AD Replication", message: "Replication partner DC-02 has not synced in last 24 hours", timestamp: "5m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 45,
      network: 1,
      errorRate: i < 3 ? 0 : 20,
      latency: 5,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 12,
      memory: 45,
      network: 4,
      errorRate: 0,
      latency: 5,
    })),
    systemLogs: [
      "[2026-06-01 16:00:00] [NTDS_REPLICATION] ERROR: The KCC (Knowledge Consistency Checker) was unable to form a replication path. Error 1722 (The RPC server is unavailable).",
      "[2026-06-01 16:05:00] [FIREWALL] BLOCK: TCP Inbound from DC-01 (10.10.10.10) to port 135 blocked.",
    ],
    commands: {
      "repadmin /showrepl": "Source: CN=NTDS Settings,CN=DC-01,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=guruai,DC=local\n******* 1024 CONSECUTIVE FAILURES SINCE 2026-05-31 16:00:00\nLast error: 1722 (0x6ba): The RPC server is unavailable.",
      "test-netconnection -computername dc-02 -port 135": "ComputerName     : dc-02\nRemoteAddress    : 10.10.10.11\nRemotePort       : 135\nInterfaceAlias   : Ethernet0\nTcpTestSucceeded : False",
      "netsh advfirewall show currentprofile": "Private Profile Settings:\n----------------------------------------------------------------------\nState                                 ON\nFirewall Policy                       BlockInbound,AllowOutbound",
    },
  },

  // ==================== NETWORK INCIDENTS ====================
  {
    id: "net-router-failure",
    domain: "NETWORK",
    title: "Router Out-Of-Memory Crash",
    severity: "P1",
    role: "Network Engineer",
    symptoms: "Complete loss of routing between local VLANs and external internet path. The core switch cannot route packets to the firewall gateway.",
    businessImpact: {
      description: "Total office network outage. Remote work, local servers, IP phones, and SaaS tools are dead. Total productivity halt.",
      financialLossPerMinute: 920,
      affectedUsers: 100,
      riskLevel: "CRITICAL",
    },
    expectedRca: "The core router ran out of memory (OOM) because of a route table leak triggered by a network loop in the staging room VLAN.",
    remediationOptions: [
      {
        id: "power-cycle-router",
        label: "Power cycle Core Router and fix loop",
        description: "Hard reboot the physical router, then shut down port gi0/24 on the staging switch to break the loop.",
        isCorrect: true,
        feedback: "Correct! Power cycling the router restored administration access, and disabling the looping switch port prevented the memory exhaustion from recurring.",
      },
      {
        id: "reboot-switches",
        label: "Reboot all access switches",
        description: "Reboot all PoE switches across the floor.",
        isCorrect: false,
        feedback: "Rebooting the switches temporarily interrupts traffic, but the core router remains hung in its OOM crashed state.",
      },
    ],
    preventiveActionOptions: [
      { text: "Enable Spanning Tree Protocol (STP) PortFast BPDU Guard on all access ports", isCorrect: true },
      { text: "Configure router control plane policing (CoPP) limits", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The internet is completely dead. Pinging anything says 'Request timed out'.",
      "I cannot ping my desk phone or the office printer next to me.",
    ],
    liveAlerts: [
      { id: "al-net-1", severity: "CRITICAL", service: "Core Networking", message: "Core Router CR-01 is unresponsive / ICMP Failure", timestamp: "3m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 0,
      memory: 0,
      network: 0,
      errorRate: 100,
      latency: 9999,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 35,
      memory: 60,
      network: 45,
      errorRate: 0,
      latency: 4,
    })),
    systemLogs: [
      "[2026-06-01 16:35:12] [ROUTER-OS] CRITICAL: System memory depleted (Total: 1024MB, Free: 0MB).",
      "[2026-06-01 16:35:15] [ROUTER-OS] ERROR: Failed to allocate buffer for incoming packets. Kernel panic: OOM.",
    ],
    commands: {
      "ping 10.10.1.1": "PING 10.10.1.1 (10.10.1.1) 56(84) bytes of data.\n--- 10.10.1.1 ping statistics ---\n5 packets transmitted, 0 received, 100% packet loss",
      "show spanning-tree": "VLAN0010\n  Spanning tree enabled protocol rstp\n  Root ID    Priority    32768\n             Address     0015.5d01.ff01\n             This bridge is the root\n  [WARNING] Port Gi0/24 is receiving topology change notifications at rate of 144/sec (Network loop suspected).",
      "ssh admin@10.10.1.1": "ssh: connect to host 10.10.1.1 port 22: Connection refused / Host is dead",
    },
  },
  {
    id: "net-vlan-misconfig",
    domain: "NETWORK",
    title: "VLAN Trunk Misconfiguration",
    severity: "P2",
    role: "Network Engineer",
    symptoms: "Workstations on VLAN 20 (Marketing) suddenly lose connection to internal servers on VLAN 10 (Datacenter) after a scheduled switch maintenance.",
    businessImpact: {
      description: "Marketing team (20 users) cut off from internal files, databases, and core application servers.",
      financialLossPerMinute: 210,
      affectedUsers: 20,
      riskLevel: "MEDIUM",
    },
    expectedRca: "The uplink trunk port configuration on access switch SW-02 was updated, but VLAN 20 was omitted from the allowed VLAN list (`switchport trunk allowed vlan 10,30`).",
    remediationOptions: [
      {
        id: "fix-vlan-trunk",
        label: "Restore VLAN 20 to Trunk Allowed List",
        description: "Run `switchport trunk allowed vlan add 20` on SW-02 port Ten1/1.",
        isCorrect: true,
        feedback: "Correct! Adding VLAN 20 back to the trunk allowed the switch to forward marketing packets over the primary link to the core router.",
      },
      {
        id: "set-access-port",
        label: "Convert uplink port to access mode",
        description: "Configure switch uplink port to access mode on VLAN 20.",
        isCorrect: false,
        feedback: "This breaks VLAN 10 and VLAN 30 on the same switch, resulting in a wider outage for other teams.",
      },
    ],
    preventiveActionOptions: [
      { text: "Use Infrastructure-as-Code (Ansible/Netmiko) to automate config updates", isCorrect: true },
      { text: "Configure Link Aggregation (LACP) with active trunk validation", isCorrect: false },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Everyone in the marketing department has lost access to the local intranet site.",
      "I can access Google, but I can't reach the local databases at 10.10.10.22.",
    ],
    liveAlerts: [
      { id: "al-vlan-1", severity: "WARNING", service: "Switch SW-02", message: "VLAN 20 inactive or pruned on Trunk Link Ten1/1", timestamp: "4m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 30,
      network: 5,
      errorRate: i < 3 ? 0 : 40,
      latency: 4,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 30,
      network: 12,
      errorRate: 0,
      latency: 4,
    })),
    systemLogs: [
      "[2026-06-01 16:10:00] [SW-02-OS] CONFIG: User 'net_admin' updated interface Ten1/1 configuration: switchport trunk allowed vlan 10,30",
      "[2026-06-01 16:11:00] [SW-02-OS] WARNING: Packets dropped for ingress VLAN 20 on egress Trunk interface Ten1/1.",
    ],
    commands: {
      "show interface trunk": "Port        Mode         Encapsulation  Status        Native vlan\nTen1/1      on           802.1q         trunking      1\n\nPort        Vlans allowed on trunk\nTen1/1      10,30\n\nPort        Vlans allowed and active in management domain\nTen1/1      10,30",
      "ping 10.10.10.22": "Sending 5, 100-byte ICMP Echos to 10.10.10.22, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)",
    },
  },
  {
    id: "net-firewall-block",
    domain: "NETWORK",
    title: "Firewall Rule Drift Outage",
    severity: "P2",
    role: "Network Engineer",
    symptoms: "The API gateway cannot pull payment profiles from the merchant vault server. Connections drop on port 443 with a reset packet.",
    businessImpact: {
      description: "Critical payment processing failure. Customers are unable to check out, leading to cart abandonment. Est Loss: $1200/min.",
      financialLossPerMinute: 1200,
      affectedUsers: 140,
      riskLevel: "CRITICAL",
    },
    expectedRca: "An automated security script pushed a dynamic block on the firewall that overrode the rule permitting TCP 443 from Zone:API to Zone:Vault.",
    remediationOptions: [
      {
        id: "restore-firewall-rule",
        label: "Restore specific port 443 access in Firewall rules",
        description: "Re-enable rule ID 104 'API-to-Vault-HTTPS' on the security appliance.",
        isCorrect: true,
        feedback: "Correct! Enabling rule ID 104 restored direct HTTPS access to the Vault gateway, allowing checkout transactions to flow.",
      },
      {
        id: "disable-firewall",
        label: "Temporarily disable firewall inspection",
        description: "Put the firewall into bypass mode.",
        isCorrect: false,
        feedback: "Bypassing the firewall violates PCI-DSS security compliance rules and triggers an immediate high-severity audit alarm.",
      },
    ],
    preventiveActionOptions: [
      { text: "Implement configuration lock and version control on firewall policies", isCorrect: true },
      { text: "Enable automatic rule rollbacks for failed health checks", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Every time I try to complete my transaction, it spinner-loops and says 'Payment Processor Unreachable'.",
    ],
    liveAlerts: [
      { id: "al-fw-1", severity: "CRITICAL", service: "Payment API", message: "Payment Vault connection timed out on port 443", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 20,
      memory: 40,
      network: 15,
      errorRate: i < 3 ? 0 : 88,
      latency: i < 3 ? 120 : 5000,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 25,
      memory: 40,
      network: 20,
      errorRate: 0,
      latency: 110,
    })),
    systemLogs: [
      "[2026-06-01 16:30:10] [FIREWALL-LOG] DENY: Src: 10.200.10.15 Dst: 10.200.50.80 Proto: TCP SPort: 49202 DPort: 443 Rule: 999 (Default-Deny-All)",
      "[2026-06-01 16:30:15] [GATEWAY-API] ERROR: Connection reset by peer to vault.guruai.local:443",
    ],
    commands: {
      "curl -k -v https://vault.guruai.local": "* Connecting to vault.guruai.local (10.200.50.80) port 443\n* Connection refused / Connection reset by peer",
      "show security policies from API to Vault": "Rule: 104 - API-to-Vault-HTTPS (Status: DISABLED)\nRule: 999 - Default-Deny-All (Status: ENABLED)",
    },
  },
  {
    id: "net-vpn-failure",
    domain: "NETWORK",
    title: "IPSec VPN Phase 2 Timeout",
    severity: "P2",
    role: "Network Engineer",
    symptoms: "The hybrid IPSec tunnel to AWS VPC is down. Cloud resources are unreachable from the on-premises database server.",
    businessImpact: {
      description: "Hybrid cloud link offline. On-prem CRM database cannot sync with AWS customer portals.",
      financialLossPerMinute: 400,
      affectedUsers: 120,
      riskLevel: "HIGH",
    },
    expectedRca: "The IPSec tunnel negotiation failed in Phase 2 because of a mismatch in encryption protocols (AES-256 vs AES-128) after AWS updated its virtual gateway profile.",
    remediationOptions: [
      {
        id: "align-ike-encryption",
        label: "Update local tunnel encryption parameters to match AWS",
        description: "Align the local IPSec proposal to use AES-256-GCM and SHA-384, matching the updated AWS gateway config.",
        isCorrect: true,
        feedback: "Correct! Correcting the encryption mismatch allowed IPSec Phase 2 (Quick Mode) to complete and bring the tunnel up.",
      },
      {
        id: "reboot-vpn-appliance",
        label: "Reboot the local VPN appliance",
        description: "Reboot the edge network firewall.",
        isCorrect: false,
        feedback: "Rebooting the hardware does not fix the parameters mismatch. Phase 2 negotiations still fail on startup.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure AWS Transit Gateway with BGP active-active dynamic routing", isCorrect: true },
      { text: "Monitor IKE negotiation failures in syslog", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The CRM web app says 'AWS Synchronization Database Unreachable'.",
    ],
    liveAlerts: [
      { id: "al-vpn-1", severity: "CRITICAL", service: "VPN", message: "IPSec Tunnel AWS-VPC-Tunnel-01 is DOWN", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 35,
      network: i < 3 ? 10 : 0.2,
      errorRate: i < 3 ? 1 : 100,
      latency: i < 3 ? 25 : 9999,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 18,
      memory: 35,
      network: 12,
      errorRate: 0,
      latency: 28,
    })),
    systemLogs: [
      "[2026-06-01 16:32:00] [VPN-DAEMON] IKE Phase 1 (Main Mode) completed successfully with 54.210.11.20.",
      "[2026-06-01 16:32:02] [VPN-DAEMON] ERROR: IKE Phase 2 (Quick Mode) failed: NO_PROPOSAL_CHOSEN. Encryption algorithms do not match peer specifications.",
    ],
    commands: {
      "show crypto ipsec sa": "Interface: Tunnel1\n   Crypto map tag: AWS-MAP, local addr: 203.0.113.15\n   [ERROR] IPSec SA is not active / Phase 2 in state: IKE_INIT",
      "show crypto ikev2 profile": "Profile: AWS-IKE-PROFILE\n   Encryption local: AES-CBC-128\n   Integrity local: SHA-1\n   [AWS Peer Spec: AES-GCM-256, SHA-256 or SHA-384]",
    },
  },
  {
    id: "net-internet-outage",
    domain: "NETWORK",
    title: "BGP Session Flapping",
    severity: "P1",
    role: "Network Engineer",
    symptoms: "Extreme internet packet loss and latency. Traffic jumps between the primary ISP and secondary ISP, causing session timeouts on all SaaS platforms.",
    businessImpact: {
      description: "Company-wide internet instability. Zoom calls disconnect, Salesforce logouts occur, remote desktops drop.",
      financialLossPerMinute: 750,
      affectedUsers: 100,
      riskLevel: "CRITICAL",
    },
    expectedRca: "The primary BGP router session is flapping because of a failing fiber optic SFP transcever reporting high error rates (optical attenuation).",
    remediationOptions: [
      {
        id: "disable-isp1-route",
        label: "Shutdown ISP-01 port and route all traffic to ISP-02",
        description: "Administratively shutdown Interface Te1/1 to force BGP failover to stable ISP-02.",
        isCorrect: true,
        feedback: "Correct! Disabling ISP-01 stopped the packet loss immediately and forced a clean BGP routing convergence to ISP-02.",
      },
      {
        id: "restart-bgp-process",
        label: "Clear BGP routing process",
        description: "Run 'clear ip bgp *' to restart routing advertisements.",
        isCorrect: false,
        feedback: "Clearing the routes forces a reload, but the optical link physical degradation remains, causing the path to flap again within 30 seconds.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure Bidirectional Forwarding Detection (BFD) to speed up failover thresholds", isCorrect: true },
      { text: "Implement automated optical power diagnostics (DOM) alerts", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I keep getting kicked off my Microsoft Teams meetings. 'Searching for network'.",
      "Loading pages is taking minutes, then they timeout. When they load, they look broken.",
    ],
    liveAlerts: [
      { id: "al-net-bgp-1", severity: "CRITICAL", service: "BGP", message: "BGP Neighbor 198.51.100.1 (ISP-01) State Flapping: Established -> Active", timestamp: "0m ago" },
      { id: "al-net-bgp-2", severity: "WARNING", service: "Router Te1/1", message: "Optical interface SFP reports low RX power (-28dBm)", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 30,
      memory: 45,
      network: i < 3 ? 60 : 5,
      errorRate: i < 3 ? 0 : 65,
      latency: i < 3 ? 15 : 2400,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 20,
      memory: 45,
      network: 40,
      errorRate: 0,
      latency: 18,
    })),
    systemLogs: [
      "[2026-06-01 16:34:00] %BGP-5-ADJCHANGE: neighbor 198.51.100.1 Down - Interface flap",
      "[2026-06-01 16:34:15] %BGP-5-ADJCHANGE: neighbor 198.51.100.1 Up - Established",
      "[2026-06-01 16:34:40] %BGP-5-ADJCHANGE: neighbor 198.51.100.1 Down - Hold Timer Expired",
    ],
    commands: {
      "show ip bgp summary": "Neighbor        V    AS    MsgRcvd    MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd\n198.51.100.1    4  65001      5401       5410      989    0    0 00:00:22  Active\n203.0.113.5     4  65002      5222       5210      989    0    0 04:12:15  Established (352000 routes)",
      "show interfaces transceiver detail": "Port  Temp(C)  Voltage(V)  TX Power(dBm)  RX Power(dBm)  Status\nTe1/1  42.5     3.31        -2.5           -28.4          Alarm Low RX Optical Power (Target: -8 to -22 dBm)",
    },
  },

  // ==================== CLOUD INCIDENTS ====================
  {
    id: "cld-aws-s3-fail",
    domain: "CLOUD",
    title: "AWS S3 CORS Access Outage",
    severity: "P2",
    role: "Cloud Engineer",
    symptoms: "Users cannot upload files or view system photos. Chrome inspector console shows CORS policy blocks on standard S3 GET requests.",
    businessImpact: {
      description: "Customer portal media viewer broken. Users unable to upload claims documents, stalling business workflows.",
      financialLossPerMinute: 250,
      affectedUsers: 150,
      riskLevel: "HIGH",
    },
    expectedRca: "A CloudFormation stack deployment overwrote the S3 bucket configuration, removing the allowed Origin hosts from the CORS XML structure.",
    remediationOptions: [
      {
        id: "restore-cors-rule",
        label: "Restore CORS Configuration on S3 Bucket",
        description: "Apply correct CORS rules permitting AllowOrigin: https://app.guruai.com to the S3 bucket configuration.",
        isCorrect: true,
        feedback: "Correct! Applying the bucket CORS JSON allowed user browsers to directly make resource calls to S3 without browser security intervention.",
      },
      {
        id: "make-s3-public",
        label: "Make S3 bucket completely public",
        description: "Set ACL to public-read and turn off block public access.",
        isCorrect: false,
        feedback: "Making the bucket public exposes client PII data, generating a security violation and failing data protection audits.",
      },
    ],
    preventiveActionOptions: [
      { text: "Add CloudFormation drift detection checks", isCorrect: true },
      { text: "Route S3 media through a CloudFront distribution with secure CORS headers", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The profile picture upload is failing. It keeps showing a broken image link.",
      "The page says 'Access to image from origin app.guruai.com has been blocked by CORS policy'.",
    ],
    liveAlerts: [
      { id: "al-cld-s3", severity: "CRITICAL", service: "Frontend App", message: "S3 Static Asset fetch failure rate > 50%", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 40,
      network: 10,
      errorRate: i < 3 ? 0 : 70,
      latency: 50,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 40,
      network: 15,
      errorRate: 0,
      latency: 45,
    })),
    systemLogs: [
      "[2026-06-01 16:33:00] [FRONTEND] ERROR: Access to fetch at 'https://guruai-media.s3.amazonaws.com/pic.jpg' from origin 'https://app.guruai.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.",
    ],
    commands: {
      "aws s3api get-bucket-cors --bucket guruai-media": "An error occurred (NoSuchCORSConfiguration) when calling the GetBucketCors operation: The CORS configuration does not exist.",
      "aws s3api get-bucket-policy --bucket guruai-media": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"AllowSecureAccessOnly\",\"Effect\":\"Deny\",\"Principal\":\"*\",\"Action\":\"s3:*\",\"Resource\":\"arn:aws:s3:::guruai-media/*\",\"Condition\":{\"Bool\":{\"aws:SecureTransport\":\"false\"}}}]}",
    },
  },
  {
    id: "cld-iam-issue",
    domain: "CLOUD",
    title: "AWS IAM Role Assumption Failure",
    severity: "P2",
    role: "Cloud Engineer",
    symptoms: "The microservice backend throws an 'AccessDenied' error when attempting to publish messages to the AWS SQS queue.",
    businessImpact: {
      description: "Message queue delivery failure. Delayed background processing for user transactions, leading to slow order fulfillments.",
      financialLossPerMinute: 310,
      affectedUsers: 80,
      riskLevel: "MEDIUM",
    },
    expectedRca: "The EC2 instance profile IAM role policy is missing the `sqs:SendMessage` permission because of a typo during an IAM policy compaction task.",
    remediationOptions: [
      {
        id: "add-sqs-permission",
        label: "Attach sqs:SendMessage permission to IAM Role",
        description: "Update IAM Policy 'AppSqsAccess' to include 'sqs:SendMessage' for the target SQS queue ARN.",
        isCorrect: true,
        feedback: "Correct! Granting sqs:SendMessage permission immediately resolved the AccessDenied error, allowing the service to process the queue backlog.",
      },
      {
        id: "use-root-api-keys",
        label: "Embed root AWS API Keys into instance env",
        description: "Write root account AccessKeyID/SecretAccessKey to .env on the servers.",
        isCorrect: false,
        feedback: "Hardcoding root credentials is a severe violation of least privilege guidelines and puts the entire cloud account at risk.",
      },
    ],
    preventiveActionOptions: [
      { text: "Run local IAM policy simulators during deployment validation", isCorrect: true },
      { text: "Monitor IAM policy change events via AWS CloudTrail", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I completed my checkout, but I haven't received an order confirmation email, and my dashboard order status is stuck on 'pending queue'.",
    ],
    liveAlerts: [
      { id: "al-iam-1", severity: "CRITICAL", service: "Notification Service", message: "AWS SDK: AccessDenied for SQS:SendMessage", timestamp: "2m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 20,
      memory: 55,
      network: 4,
      errorRate: i < 3 ? 1 : 45,
      latency: 15,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 25,
      memory: 55,
      network: 8,
      errorRate: 0,
      latency: 12,
    })),
    systemLogs: [
      "[2026-06-01 16:32:11] [BACKEND] ERROR: com.amazonaws.services.sqs.model.AmazonSQSException: Access to the resource https://sqs.us-east-1.amazonaws.com/12345/AppQueue is denied. (Service: AmazonSQS; Status Code: 403; Error Code: AccessDenied)",
    ],
    commands: {
      "aws iam get-role-policy --role-name AppInstanceRole --policy-name AppSqsAccess": "{\n    \"RoleName\": \"AppInstanceRole\",\n    \"PolicyName\": \"AppSqsAccess\",\n    \"PolicyDocument\": {\n        \"Version\": \"2012-10-17\",\n        \"Statement\": [\n            {\n                \"Effect\": \"Allow\",\n                \"Action\": [\n                    \"sqs:ReceiveMessage\",\n                    \"sqs:DeleteMessage\",\n                    \"sqs:GetQueueAttributes\"\n                ],\n                \"Resource\": \"arn:aws:sqs:us-east-1:123456789012:AppQueue\"\n            }\n        ]\n    }\n}",
      "aws sts get-caller-identity": "{\n    \"UserId\": \"AROAXXXYYYZZZ:i-0c8a5a41bf\",\n    \"Account\": \"123456789012\",\n    \"Arn\": \"arn:aws:sts::123456789012:assumed-role/AppInstanceRole/i-0c8a5a41bf\"\n}",
    },
  },
  {
    id: "cld-vpc-misconfig",
    domain: "CLOUD",
    title: "VPC Route Table Drift",
    severity: "P2",
    role: "Cloud Engineer",
    symptoms: "Public Web Servers in Subnet-A are unreachable from the internet, while servers in Subnet-B are active. Diagnostic pings from external systems time out.",
    businessImpact: {
      description: "50% capacity drop. Slow response times and errors for 50% of incoming users. Costing $600/min in lost conversions.",
      financialLossPerMinute: 600,
      affectedUsers: 300,
      riskLevel: "HIGH",
    },
    expectedRca: "A Terraform run applied a route table association drift, replacing the Internet Gateway route (0.0.0.0/0 -> igw-xxx) with a dead target in Subnet-A's table.",
    remediationOptions: [
      {
        id: "restore-igw-route",
        label: "Restore Internet Gateway (IGW) route to Subnet-A Route Table",
        description: "Add route 0.0.0.0/0 pointing to target igw-01af22bb on Route Table rtb-subnet-a-public.",
        isCorrect: true,
        feedback: "Correct! Restoring the IGW path allowed Subnet-A servers to communicate with internet clients.",
      },
      {
        id: "reboot-ec2-instances",
        label: "Reboot Subnet-A instances",
        description: "Force stop and start the EC2 instances in Subnet-A.",
        isCorrect: false,
        feedback: "The instances reboot, but they still cannot reach the IGW because the VPC routing table remains misconfigured.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure Terraform drift alerts via AWS Config rules", isCorrect: true },
      { text: "Perform route tables assertions in post-deployment scripts", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The page keeps spinning and returns 'Server Unreachable' half the time when I refresh.",
    ],
    liveAlerts: [
      { id: "al-vpc-1", severity: "CRITICAL", service: "Load Balancer", message: "Target group reports 50% of instances in Unhealthy state", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 40,
      memory: 50,
      network: i < 3 ? 30 : 15,
      errorRate: i < 3 ? 0 : 50,
      latency: i < 3 ? 80 : 3500,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 35,
      memory: 50,
      network: 32,
      errorRate: 0,
      latency: 85,
    })),
    systemLogs: [
      "[2026-06-01 16:34:01] [AWS-ELB] WARNING: Health check failed for target i-0912fa0a (Subnet-A): connection timed out.",
      "[2026-06-01 16:35:10] [AWS-VPC] ERROR: Packet dropped: No route from 10.0.1.15 to internet destination.",
    ],
    commands: {
      "aws ec2 describe-route-tables --route-table-ids rtb-01a2b3c4": "{\n    \"RouteTables\": [\n        {\n            \"RouteTableId\": \"rtb-01a2b3c4\",\n            \"Routes\": [\n                {\n                    \"DestinationCidrBlock\": \"10.0.0.0/16\",\n                    \"GatewayId\": \"local\",\n                    \"State\": \"active\"\n                }\n            ],\n            \"Associations\": [\n                { \"SubnetId\": \"subnet-01public-a\" }\n            ]\n        }\n    ]\n}",
      "aws ec2 describe-route-tables --route-table-ids rtb-09public-b": "{\n    \"RouteTables\": [\n        {\n            \"RouteTableId\": \"rtb-09public-b\",\n            \"Routes\": [\n                {\n                    \"DestinationCidrBlock\": \"10.0.0.0/16\",\n                    \"GatewayId\": \"local\",\n                    \"State\": \"active\"\n                },\n                {\n                    \"DestinationCidrBlock\": \"0.0.0.0/0\",\n                    \"GatewayId\": \"igw-01af22bb\",\n                    \"State\": \"active\"\n                }\n            ]\n        }\n    ]\n}",
    },
  },
  {
    id: "cld-storage-fail",
    domain: "CLOUD",
    title: "AWS EBS IOPS Exhaustion Outage",
    severity: "P2",
    role: "Cloud Engineer",
    symptoms: "The primary database server has stopped processing transactions. Logins are hung and write queries are queueing infinitely.",
    businessImpact: {
      description: "Database locks stall all customer facing operations. Checkout is completely offline. Loss: $1500/min.",
      financialLossPerMinute: 1500,
      affectedUsers: 450,
      riskLevel: "CRITICAL",
    },
    expectedRca: "The database EBS volume (gp2 type) has depleted its burst balance IOPS credits because of an unindexed nightly analytics report run.",
    remediationOptions: [
      {
        id: "upgrade-ebs-gp3",
        label: "Modify SDB volume to gp3 and provision 3000 IOPS",
        description: "Perform live volume modification via AWS CLI to change volume type from gp2 to gp3 and specify 3000 dedicated IOPS.",
        isCorrect: true,
        feedback: "Correct! Upgrading to gp3 eliminated dynamic burst depletion, instantly restoring database throughput.",
      },
      {
        id: "reboot-db",
        label: "Force reboot DB server",
        description: "Reboot the PostgreSQL EC2 database server.",
        isCorrect: false,
        feedback: "Rebooting releases lock states momentarily, but write requests immediately flood back and stall again since storage throughput remains throttled.",
      },
    ],
    preventiveActionOptions: [
      { text: "Create CloudWatch alarm for VolumeBurstBalance <= 10%", isCorrect: true },
      { text: "Add index constraints to slow running database query columns", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The app hangs whenever I try to add items to my card, then gives a gateway error.",
    ],
    liveAlerts: [
      { id: "al-ebs-1", severity: "CRITICAL", service: "PostgreSQL Database", message: "Write IO Wait latency exceeded 1500ms", timestamp: "0m ago" },
      { id: "al-ebs-2", severity: "CRITICAL", service: "Storage vol-08da12", message: "BurstBalance is at 0%", timestamp: "2m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: i < 3 ? 15 : 99, // CPU spikes due to IO wait
      memory: 80,
      network: i < 3 ? 8 : 0.1,
      errorRate: i < 3 ? 0 : 95,
      latency: i < 3 ? 20 : 8500,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 25,
      memory: 70,
      network: 10,
      errorRate: 0,
      latency: 18,
    })),
    systemLogs: [
      "[2026-06-01 16:32:00] [POSTGRES] WARNING: archiver process waiting on write locks for base/16384/2613.",
      "[2026-06-01 16:32:15] [KERNEL] INFO: task postgres:2341 blocked for more than 120 seconds. (IO wait state)",
    ],
    commands: {
      "aws cloudwatch get-metric-data --metric-name BurstBalance --volume-id vol-08da12": "VolumeId: vol-08da12\nMetric: BurstBalance\nTimestamp           Value\n16:30:00            0.00\n16:20:00            0.12\n16:10:00            4.80",
      "aws ec2 describe-volumes --volume-ids vol-08da12": "{\n    \"Volumes\": [\n        {\n            \"VolumeId\": \"vol-08da12\",\n            \"Size\": 100,\n            \"VolumeType\": \"gp2\",\n            \"Iops\": 300,\n            \"State\": \"in-use\"\n        }\n    ]\n}",
      "iostat -x 1 5": "Device:         rrqm/s   wrqm/s     r/s     w/s    rkB/s    wkB/s aqu-sz  await  svctm  %util\nxvdba             0.00    14.00    1.00  300.00     4.00  2400.00  42.50 142.20   3.30 100.00",
    },
  },
  {
    id: "cld-alb-failure",
    domain: "CLOUD",
    title: "ALB Host Header Routing Misconfig",
    severity: "P2",
    role: "Cloud Engineer",
    symptoms: "Traffic to https://api.guruai.com fails with a 503 Service Unavailable, while https://guruai.com works fine.",
    businessImpact: {
      description: "Outbound API calls fail for external client integrations. B2B services are reporting downtime. Risk: Contract SLA breach.",
      financialLossPerMinute: 500,
      affectedUsers: 90,
      riskLevel: "HIGH",
    },
    expectedRca: "The Application Load Balancer listener rule for host header 'api.guruai.com' was misconfigured to route to an empty Target Group (tg-api-new) that has no active, healthy backends.",
    remediationOptions: [
      {
        id: "fix-alb-routing",
        label: "Update ALB Listener rule target group",
        description: "Re-point the host header routing rule for 'api.guruai.com' back to target group 'tg-api-stable'.",
        isCorrect: true,
        feedback: "Correct! Pointing the listener rule back to the healthy target group instantly restored API traffic flow.",
      },
      {
        id: "restart-instances",
        label: "Restart target backend instances",
        description: "Reboot target nodes under tg-api-new.",
        isCorrect: false,
        feedback: "There are no instances registered in tg-api-new, so rebooting existing web servers has no effect.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure active ALB default routing rules", isCorrect: false },
      { text: "Perform structural configuration validation before applying Terraform changes", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Our automated scripts are getting 503 errors when connecting to your API portal.",
    ],
    liveAlerts: [
      { id: "al-alb-1", severity: "CRITICAL", service: "Application Load Balancer", message: "5XX Error Spike on API Gateway (> 25%)", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 20,
      network: 15,
      errorRate: i < 3 ? 0 : 100,
      latency: 5,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 22,
      network: 18,
      errorRate: 0,
      latency: 14,
    })),
    systemLogs: [
      "[2026-06-01 16:32:00] [AWS-ALB] HTTP/1.1 503 ServiceUnavailable - Src: 204.140.10.2 Dst: api.guruai.com TargetGroup: tg-api-new (0 healthy targets)",
    ],
    commands: {
      "aws elbv2 describe-rules --listener-arn arn:aws:elasticloadbalancing:us-east-1:1234:listener/app/alb-prod": "Rules:\n  Priority: 1, HostHeader: api.guruai.com -> TargetGroupArn: tg-api-new\n  Priority: 2, HostHeader: guruai.com -> TargetGroupArn: tg-web-prod",
      "aws elbv2 describe-target-health --target-group-arn tg-api-new": "TargetHealthDescriptions: [] (Empty Target Group!)",
      "aws elbv2 describe-target-health --target-group-arn tg-api-stable": "TargetHealthDescriptions:\n  - TargetId: i-0abc1234, HealthState: healthy\n  - TargetId: i-0xyz9876, HealthState: healthy",
    },
  },

  // ==================== DEVOPS INCIDENTS ====================
  {
    id: "dev-cicd-fail",
    domain: "DEVOPS",
    title: "Docker Registry Disk Full Pipeline Outage",
    severity: "P2",
    role: "DevOps Engineer",
    symptoms: "The deployment CI/CD pipeline fails during the build step. Code pushed to git cannot build or release. Error: 'write error: no space left on device'.",
    businessImpact: {
      description: "Deployment pipeline blocked. Developers cannot ship emergency fixes or code updates. High engineering friction.",
      financialLossPerMinute: 110,
      affectedUsers: 15,
      riskLevel: "MEDIUM",
    },
    expectedRca: "The Jenkins runner instance ran out of local disk space due to years of cached uncleaned Docker images and dangling build layers.",
    remediationOptions: [
      {
        id: "docker-prune",
        label: "Execute Docker System Prune on runner",
        description: "Run 'docker system prune -a -f --volumes' on the build runner.",
        isCorrect: true,
        feedback: "Correct! Pruning the Docker system reclaimed 145GB of storage, enabling pipelines to build images and compile code.",
      },
      {
        id: "increase-vm-spec",
        label: "Resize Jenkins AWS EC2 Instance",
        description: "Change the instance type from t3.xlarge to c5.2xlarge.",
        isCorrect: false,
        feedback: "Upgrading instance computes increases processing speed but does not resolve the local storage disk fullness block.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure weekly cron jobs to run docker system prune", isCorrect: true },
      { text: "Implement build disk alarms (CloudWatch / NodeExporter) at 85% threshold", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "My hotfix PR got merged but the pipeline failed. Build logs say 'no space left on device'. Need to release!",
    ],
    liveAlerts: [
      { id: "al-dev-1", severity: "CRITICAL", service: "CI/CD Pipeline", message: "Build job 'App-Service-Build' Status: FAILED", timestamp: "0m ago" },
      { id: "al-dev-2", severity: "CRITICAL", service: "Jenkins Host", message: "Root storage volume at 100% capacity", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 5,
      memory: 20,
      network: 0.1,
      errorRate: i < 3 ? 0 : 100,
      latency: 0,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 65,
      memory: 40,
      network: 85,
      errorRate: 0,
      latency: 5,
    })),
    systemLogs: [
      "[2026-06-01 16:30:00] [JENKINS] Step 'Docker Build' started.",
      "[2026-06-01 16:30:15] [JENKINS] [DOCKER] Building layer 12/18",
      "[2026-06-01 16:30:20] [JENKINS] [ERROR] docker: failed to copy files: write error: no space left on device. Build terminated.",
    ],
    commands: {
      "df -h": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/xvda1       80G   80G    0G 100% /\ntmpfs            16G     0   16G   0% /dev/shm",
      "docker system df": "TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          122       4         72.5GB    68.2GB (94%)\nContainers      5         1         120MB     100MB\nLocal Volumes   22        0         6.8GB     6.8GB\nBuild Cache     422       0         8.2GB     8.2GB",
    },
  },
  {
    id: "dev-k8s-crashloop",
    domain: "DEVOPS",
    title: "K8s CrashLoopBackOff Outage",
    severity: "P2",
    role: "DevOps Engineer",
    symptoms: "The primary user authentication service is down. Microservice pods show status: CrashLoopBackOff in the Kubernetes cluster dashboard.",
    businessImpact: {
      description: "Complete login outage on the web app. Existing logins work, but no new users can authenticate.",
      financialLossPerMinute: 650,
      affectedUsers: 340,
      riskLevel: "CRITICAL",
    },
    expectedRca: "The authentication pod is crashing on startup because it is missing a required environment variable secret (`JWT_SECRET`) which was deleted from Vault.",
    remediationOptions: [
      {
        id: "restore-jwt-secret",
        label: "Restore JWT_SECRET key-value to Kubernetes secrets",
        description: "Re-create the Kubernetes Secret 'auth-secrets' with a valid 'JWT_SECRET' payload, then restart the deployment.",
        isCorrect: true,
        feedback: "Correct! Restoring the JWT_SECRET allowed the pod configuration init-check to pass and successfully establish user login loops.",
      },
      {
        id: "delete-pods",
        label: "Delete pods to trigger replica replacement",
        description: "Run 'kubectl delete pods -l app=auth-service'.",
        isCorrect: false,
        feedback: "Deleting the pods recreates them, but the template spec remains broken. The new pods fail and return to CrashLoopBackOff state immediately.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure Kubernetes liveness and readiness probes properly", isCorrect: true },
      { text: "Enable GitOps auditing (ArgoCD/Flux) to prevent drift in secret configs", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I cannot log in to the platform. It spins, then says 'Internal Server Error (500)'.",
    ],
    liveAlerts: [
      { id: "al-k8s-1", severity: "CRITICAL", service: "K8s Cluster", message: "Deployment 'auth-service' pods in CrashLoopBackOff state", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 1,
      memory: 50,
      network: 0.1,
      errorRate: i < 3 ? 1 : 100,
      latency: 9999,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 30,
      memory: 45,
      network: 15,
      errorRate: 0,
      latency: 25,
    })),
    systemLogs: [
      "[2026-06-01 16:35:10] [KUBE-SCHEDULER] Pod auth-service-7fbd6 started.",
      "[2026-06-01 16:35:12] [POD-CONTAINER] FATAL: JWT_SECRET environment variable is null or empty. Authentication service cannot sign tokens.",
      "[2026-06-01 16:35:13] [KUBE-LOG] Pod auth-service-7fbd6 exited with code 1. Restarting in 10s (CrashLoopBackOff).",
    ],
    commands: {
      "kubectl get pods": "NAME                            READY   STATUS              RESTARTS   AGE\nauth-service-7fbd6-xyz12        0/1     CrashLoopBackOff    6          8m\npayment-service-88bca-abc01     1/1     Running             0          4h",
      "kubectl logs deployment/auth-service": "FATAL ERROR: Environment initialization failed.\nError: Key 'JWT_SECRET' is not defined in system environment variables.\nExiting process.",
      "kubectl describe pod auth-service-7fbd6-xyz12": "Containers:\n  auth-service:\n    Environment:\n      JWT_SECRET: <set from secret 'auth-secrets' key 'JWT_SECRET'>\n\nConditions:\n  Ready: False\nEvents:\n  Warning  BackOff    1m (x22 over 8m)  kubelet  Back-off restarting failed container",
    },
  },
  {
    id: "dev-docker-fail",
    domain: "DEVOPS",
    title: "Docker Container DNS Resolution Loop",
    severity: "P2",
    role: "DevOps Engineer",
    symptoms: "A newly deployed Docker microservice cannot connect to database or API containers, returning 'getaddrinfo ENOTFOUND db-prod'.",
    businessImpact: {
      description: "Application functionality offline. Catalog and product search is broken. Loss: $280/min.",
      financialLossPerMinute: 280,
      affectedUsers: 110,
      riskLevel: "MEDIUM",
    },
    expectedRca: "The docker container was launched on the default bridge network instead of the user-defined bridge network ('app-network'), disabling Docker's internal DNS resolution engine.",
    remediationOptions: [
      {
        id: "reconnect-docker-network",
        label: "Connect container to app-network",
        description: "Run 'docker network connect app-network web-app' and restart the container.",
        isCorrect: true,
        feedback: "Correct! Connecting the container to the custom bridge network activated the internal DNS, allowing the container to resolve 'db-prod' instantly.",
      },
      {
        id: "hardcode-db-ip",
        label: "Hardcode Docker bridge IP in config",
        description: "Replace hostname 'db-prod' with IP address '172.17.0.2'.",
        isCorrect: false,
        feedback: "Hardcoding dynamically assigned bridge container IPs breaks configuration portability; the IP will change as soon as the database container restarts.",
      },
    ],
    preventiveActionOptions: [
      { text: "Always specify custom networks in docker-compose.yml files", isCorrect: true },
      { text: "Use Docker internal service discovery tools", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "I get a '500 Server Error' when looking at items in the product store.",
    ],
    liveAlerts: [
      { id: "al-dock-1", severity: "CRITICAL", service: "Web Service", message: "Database connection failed - ENOTFOUND db-prod", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 5,
      memory: 20,
      network: 1,
      errorRate: i < 3 ? 0 : 80,
      latency: i < 3 ? 5 : 5000,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 18,
      memory: 22,
      network: 8,
      errorRate: 0,
      latency: 12,
    })),
    systemLogs: [
      "[2026-06-01 16:30:00] [APP] Connecting to database: db-prod:5432",
      "[2026-06-01 16:30:01] [APP] ERROR: getaddrinfo ENOTFOUND db-prod. Connection terminated.",
    ],
    commands: {
      "docker network ls": "NETWORK ID     NAME          DRIVER    SCOPE\n5c41bf280c8a   bridge        bridge    local\naa9876543210   app-network   bridge    local\n0123456789ab   host          host      local",
      "docker inspect web-app": "[\n    {\n        \"Id\": \"web-app\",\n        \"NetworkSettings\": {\n            \"Networks\": {\n                \"bridge\": {\n                    \"NetworkID\": \"5c41bf280c8a\",\n                    \"IPAddress\": \"172.17.0.3\"\n                }\n            }\n        }\n    }\n]",
      "docker inspect db-prod": "[\n    {\n        \"Id\": \"db-prod\",\n        \"NetworkSettings\": {\n            \"Networks\": {\n                \"app-network\": {\n                    \"NetworkID\": \"aa9876543210\",\n                    \"IPAddress\": \"172.18.0.2\"\n                }\n            }\n        }\n    }\n]",
    },
  },
  {
    id: "dev-alert-storm",
    domain: "DEVOPS",
    title: "Prometheus Monitoring Alert Storm",
    severity: "P2",
    role: "DevOps Engineer",
    symptoms: "PagerDuty is flooded with 300+ alerts representing high memory usage, API latency, and disk blocks simultaneously. System channels are clogged.",
    businessImpact: {
      description: "Alert fatigue. Critical alerts are buried under noise, risking missing actual service outages. Engineering team distracted.",
      financialLossPerMinute: 80,
      affectedUsers: 0,
      riskLevel: "MEDIUM",
    },
    expectedRca: "A Prometheus Alertmanager route group matching regex '*' was deployed without rate limits or group waits, forwarding every raw host metric threshold flap instantly.",
    remediationOptions: [
      {
        id: "configure-alertmanager-grouping",
        label: "Implement Alertmanager grouping and inhibitors",
        description: "Apply correct group_by: ['alertname', 'cluster', 'service'] configurations with a group_wait: 30s in Alertmanager.yml.",
        isCorrect: true,
        feedback: "Correct! Implementing grouping rolled up 300 individual host alerts into 2 neat summary messages per service, silencing the storm.",
      },
      {
        id: "silence-pagerduty",
        label: "Mute PagerDuty integrations for 2 hours",
        description: "Pause PagerDuty alerts to give engineers a break.",
        isCorrect: false,
        feedback: "Muting alerts leaves the system blind to real, critical outages. If a database crashed during this time, no one would be notified.",
      },
    ],
    preventiveActionOptions: [
      { text: "Implement alerting thresholds using anomaly detection (predict_linear)", isCorrect: true },
      { text: "Configure inhibitor rules in Prometheus to mute detail alerts when root hosts are down", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Slack channels are getting 20 alerts per second. Phones are buzzing non-stop. Alert channels are useless right now.",
    ],
    liveAlerts: [
      { id: "al-storm-1", severity: "CRITICAL", service: "Alertmanager", message: "Alert Queue Buffer full - dropping notifications", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 30,
      network: 1,
      errorRate: 0,
      latency: 5,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 30,
      network: 1,
      errorRate: 0,
      latency: 5,
    })),
    systemLogs: [
      "[2026-06-01 16:22:00] [ALERTMANAGER] INFO: Received 425 alerts in 1.2 seconds.",
      "[2026-06-01 16:22:02] [ALERTMANAGER] INFO: Sending 425 slack webhooks. Execution queue backlog growing.",
    ],
    commands: {
      "cat /etc/alertmanager/alertmanager.yml": "route:\n  receiver: 'slack-notifications'\n  group_wait: 0s # NO GROUPING WAIT\n  group_interval: 0s # NO INTERVAL RESTS\n  repeat_interval: 1m",
    },
  },
  {
    id: "dev-deploy-fail",
    domain: "DEVOPS",
    title: "Canary Rollout Lockup",
    severity: "P2",
    role: "DevOps Engineer",
    symptoms: "A new software deployment is stuck at 10% canary traffic. The rollout is locked, and clients routed to the canary see HTTP 500 errors.",
    businessImpact: {
      description: "Stalled deployment block. New features can't release. 10% of users are seeing severe errors.",
      financialLossPerMinute: 450,
      affectedUsers: 120,
      riskLevel: "HIGH",
    },
    expectedRca: "The canary application image depends on an updated database schema, but the migration script has not been run on the production database, causing SQL schema mismatch crashes.",
    remediationOptions: [
      {
        id: "rollback-run-migration",
        label: "Rollback Canary deployment and execute migration",
        description: "Rollback the canary pods to v1.12, run the database schema migrations, and trigger rollout restart.",
        isCorrect: true,
        feedback: "Correct! Rolling back removed the bad pods from traffic, and executing migrations allowed the new canary pods to boot successfully during the retry.",
      },
      {
        id: "force-promote",
        label: "Force promote canary to 100% traffic",
        description: "Bypass health checks and push code to all web nodes.",
        isCorrect: false,
        feedback: "Promoting the broken code to 100% of traffic crashes all web servers, turning a partial incident into a total system outage.",
      },
    ],
    preventiveActionOptions: [
      { text: "Integrate database migration stages into the CD pipeline before compute rollout", isCorrect: true },
      { text: "Configure canary analysis pipelines (Flagger/Argo Rollouts) to auto-rollback on error spikes", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Sometimes when I click the dashboard, the page says 'Table columns mismatch'. It works on refreshing occasionally.",
    ],
    liveAlerts: [
      { id: "al-dep-1", severity: "CRITICAL", service: "Rollout Engine", message: "Canary rollout of v1.13 stuck. Error rate on canary targets > 80%", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 40,
      network: 20,
      errorRate: i < 3 ? 0 : 10, // 10% overall error rate (100% error for 10% of users)
      latency: i < 3 ? 45 : 450,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 20,
      memory: 40,
      network: 25,
      errorRate: 0,
      latency: 48,
    })),
    systemLogs: [
      "[2026-06-01 16:32:00] [ROLLOUT] Routing 10% traffic to service-canary-74bf.",
      "[2026-06-01 16:32:10] [CANARY] ERROR: PG::UndefinedColumn: ERROR: column users.two_factor_enabled does not exist at App.rb line 45",
    ],
    commands: {
      "kubectl get rollouts": "NAME           DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   STATUS\nweb-rollout    10        10        1            9           Paused (Canary Error Threshold Exceeded)",
      "db-migrate status": "Status  Migration ID    Description\n======  ============    ===========\n  UP    20260401120000  Initialize tables\n DOWN   20260522143000  Add dynamic MFA column to users # NOT APPLIED",
    },
  },

  // ==================== SECURITY INCIDENTS ====================
  {
    id: "sec-ransomware",
    domain: "SECURITY",
    title: "Ransomware Lateral Encryption Attack",
    severity: "P1",
    role: "Security Team",
    symptoms: "Local files on office shares are changing extension to '.locked'. Administrative files are overwritten with 'RESTORE_INSTRUCTIONS.txt'.",
    businessImpact: {
      description: "Critical data hostage event. Customer data, finance sheets, and shared folders encrypted. Est Loss: $2000/min.",
      financialLossPerMinute: 2000,
      affectedUsers: 100,
      riskLevel: "CRITICAL",
    },
    expectedRca: "An office workstation (10.10.20.14) was infected with ransomware via a phishing attachment and is laterally encrypting the network SMB shares over VPN.",
    remediationOptions: [
      {
        id: "isolate-host-restore",
        label: "Isolate network port of infected host and restore from offline backup",
        description: "Locate host 10.10.20.14 and shutdown its switch port/VPN connection, then restore SMB file shares from the latest immutable shadow backup.",
        isCorrect: true,
        feedback: "Correct! Isolating the source workstation (10.10.20.14) stopped the active encryption stream, and restoring files from backup recovered company data cleanly.",
      },
      {
        id: "pay-ransom",
        label: "Pay the BTC ransom demand",
        description: "Submit request to transfer 2.5 BTC to the hackers.",
        isCorrect: false,
        feedback: "Paying the ransom is highly discouraged, violates security compliance frameworks, and does not guarantee receiving valid decryption keys.",
      },
      {
        id: "reboot-file-server",
        label: "Reboot the file server",
        description: "Reboot the NAS/file share server.",
        isCorrect: false,
        feedback: "Rebooting the server temporarily stops the encryption, but the infected host will reconnect and resume encrypting files as soon as the share comes back online.",
      },
    ],
    preventiveActionOptions: [
      { text: "Deploy active Endpoint Detection & Response (EDR) agents to restrict lateral movement", isCorrect: true },
      { text: "Enable access auditing (FSRM) to auto-block suspicious file renaming activity", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "All my files on the Shared folder are ending in .locked, and I cannot open them. Help!",
      "I see a text file on my desktop telling me to pay $5,000 in Bitcoin.",
    ],
    liveAlerts: [
      { id: "al-sec-1", severity: "CRITICAL", service: "File Server", message: "Massive write/rename volume detected (File change rate > 1200/sec)", timestamp: "0m ago" },
      { id: "al-sec-2", severity: "CRITICAL", service: "Intrusion Detection", message: "Tor network connection detected from host 10.10.20.14", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 85,
      memory: 70,
      network: i < 3 ? 10 : 80, // High network activity during encrypt
      errorRate: 10,
      latency: 200,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 15,
      memory: 35,
      network: 4,
      errorRate: 0,
      latency: 5,
    })),
    systemLogs: [
      "[2026-06-01 16:35:00] [AUDIT-SMB] User 'finance_staff' renamed 'Invoice_2026.pdf' to 'Invoice_2026.pdf.locked' (Host: 10.10.20.14).",
      "[2026-06-01 16:35:01] [AUDIT-SMB] User 'finance_staff' renamed 'Q1_Report.xlsx' to 'Q1_Report.xlsx.locked' (Host: 10.10.20.14).",
      "[2026-06-01 16:35:05] [IDS] WARNING: Host 10.10.20.14 initiated SSH transfer to known ransomware Command & Control IP.",
    ],
    commands: {
      "netstat -ano | findstr 445": "TCP    10.10.10.15:445     10.10.20.14:52882    ESTABLISHED     2104 (Active encrypted SMB session)",
      "show switch ports status": "Port      VLAN  Status      Speed      Host IP\nGi0/2     20    Connected   1Gbps      10.10.20.14\nGi0/3     20    Connected   1Gbps      10.10.20.15",
    },
  },
  {
    id: "sec-suspicious-login",
    domain: "SECURITY",
    title: "Admin Portal Credential Stuffing",
    severity: "P2",
    role: "Security Team",
    symptoms: "Sudden spike in admin login failures from foreign IP ranges. The security dashboard shows attempts to access the management panel.",
    businessImpact: {
      description: "Targeted brute-force attempt. Risk of complete administrative account takeover and cloud compromise.",
      financialLossPerMinute: 120,
      affectedUsers: 0,
      riskLevel: "HIGH",
    },
    expectedRca: "A distributed credential stuffing attack is executing against the '/admin/login' route from a public proxy list.",
    remediationOptions: [
      {
        id: "enable-admin-rate-limit-mfa",
        label: "Enable strict Cloudflare rate limiting and force Admin IP whitelist",
        description: "Deploy a Cloudflare WAF rule restricting '/admin/*' path to the corporate VPN source IPs and force MFA enforcement.",
        isCorrect: true,
        feedback: "Correct! Restricting '/admin' access to corporate IPs blocked all external attacker attempts, securing the administrative console.",
      },
      {
        id: "change-admin-passwords",
        label: "Change passwords of all administrators",
        description: "Initiate password resets for admin accounts.",
        isCorrect: false,
        feedback: "This secures individual accounts temporarily, but does not block the massive botnet traffic from continuing to spam the login portal.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure Web Application Firewall (WAF) bot-fighting modes", isCorrect: true },
      { text: "Deploy risk-based conditional access policies in Identity Provider", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The admin login portal is responding very slowly. Sometimes it gets a '429 Too Many Requests' error.",
    ],
    liveAlerts: [
      { id: "al-sec-login", severity: "CRITICAL", service: "Admin Auth", message: "Failed login threshold exceeded (>500 attempts in 5m)", timestamp: "0m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 45,
      memory: 30,
      network: 15,
      errorRate: i < 3 ? 0 : 35,
      latency: i < 3 ? 80 : 850,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 30,
      network: 4,
      errorRate: 0,
      latency: 42,
    })),
    systemLogs: [
      "[2026-06-01 16:34:10] [AUTH] Login failed for user 'admin' from IP 185.220.101.4 (Country: RU).",
      "[2026-06-01 16:34:12] [AUTH] Login failed for user 'root' from IP 195.154.22.18 (Country: UA).",
      "[2026-06-01 16:34:15] [AUTH] Login failed for user 'sysadmin' from IP 91.240.118.9 (Country: CN).",
    ],
    commands: {
      "grep -i 'failed' /var/log/nginx/access.log | head -n 5": "185.220.101.4 - - [01/Jun/2026:16:34:10] \"POST /admin/login HTTP/1.1\" 401 22 \"-\"\n195.154.22.18 - - [01/Jun/2026:16:34:12] \"POST /admin/login HTTP/1.1\" 401 22 \"-\"\n91.240.118.9 - - [01/Jun/2026:16:34:15] \"POST /admin/login HTTP/1.1\" 401 22 \"-\"",
      "show waf rules status": "Rule: Block-Admin-External (Status: OFF)\nRule: Rate-Limit-Login-Portal (Status: OFF)",
    },
  },
  {
    id: "sec-malware-infection",
    domain: "SECURITY",
    title: "Exchange Server Trojan Execution",
    severity: "P1",
    role: "Security Team",
    symptoms: "The email gateway is blacklisted for sending massive phishing campaigns. Security reports show outbound traffic on port 25 originating from the Exchange mail server.",
    businessImpact: {
      description: "Email system blacklisted. Outgoing business communication is blocked by client servers, halting sales pipelines.",
      financialLossPerMinute: 650,
      affectedUsers: 100,
      riskLevel: "CRITICAL",
    },
    expectedRca: "An unpatched vulnerability in the Exchange server (ProxyLogon) allowed attackers to write a web shell (Trojan) and exploit the server to distribute spam.",
    remediationOptions: [
      {
        id: "quarantine-repatch-exchange",
        label: "Isolate Exchange server dynamic external ports and apply security patches",
        description: "Sever external dynamic RPC links, terminate the web shell processes, apply the KB5000871 Exchange security update, and clear spam queues.",
        isCorrect: true,
        feedback: "Correct! Applying the security patch closed the XML execution gap, and clearing the queues restored mail delivery stability.",
      },
      {
        id: "blacklist-spammers",
        label: "Blacklist the spam recipient domains",
        description: "Block outbound mail to Gmail and Outlook.",
        isCorrect: false,
        feedback: "This does not stop the Trojan shell on the local Exchange server, and completely halts legitimate emails to the largest mail systems.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure active patch management schedules with automated validation", isCorrect: true },
      { text: "Limit outbound SMTP traffic (port 25) strictly to trusted relays", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "Customers are calling us saying they received suspicious emails containing invoice ZIP attachments from our accounts.",
      "Outgoing emails to partners are bouncing with 'Rejected due to sending IP in blacklist'.",
    ],
    liveAlerts: [
      { id: "al-sec-mal-1", severity: "CRITICAL", service: "Mail Gateway", message: "Outbound SMTP Queue exceeds 50,000 messages", timestamp: "0m ago" },
      { id: "al-sec-mal-2", severity: "CRITICAL", service: "Reputation Monitor", message: "Corporate Mail IP (198.51.100.22) listed on Spamhaus SBL/XBL", timestamp: "5m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 98, // High CPU on server from spam scripts
      memory: 90,
      network: 85,
      errorRate: 15,
      latency: 500,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 25,
      memory: 55,
      network: 5,
      errorRate: 0,
      latency: 12,
    })),
    systemLogs: [
      "[2026-06-01 15:10:00] [EXCHANGE-SERVER] POST /ecp/default.aspx - Admin access bypass exploit detected.",
      "[2026-06-01 15:10:05] [EXCHANGE-SERVER] Executed command: cmd.exe /c powershell -enc JABjAGwAaQBlAG4AdAA... (Webshell trojan write)",
    ],
    commands: {
      "ps -ef | grep Exchange": "SYSTEM       1224   0.0  0.5  cmd.exe /c powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\inetpub\\wwwroot\\aspnet_client\\discover.ps1 (Trojan active)",
      "show smtp-queue-count": "Total queued messages: 54,204\nSending threads active: 128\nStatus: Sending phish payloads",
      "wmic product get name,version | grep Exchange": "Microsoft Exchange Server 2019   Version: 15.02.0792.003 (Vulnerable to ProxyLogon)",
    },
  },
  {
    id: "sec-credential-leak",
    domain: "SECURITY",
    title: "AWS Access Key Github Leak",
    severity: "P1",
    role: "Security Team",
    symptoms: "AWS GuardDuty triggers critical alerts for API access from unauthorized locations. Unrecognized EC2 spot instances are spinning up in multiple regions.",
    businessImpact: {
      description: "Active cloud account compromise. Threat actors are utilizing corporate resources for crypto mining. Risk: Massive cloud bill and data theft.",
      financialLossPerMinute: 1100,
      affectedUsers: 0,
      riskLevel: "CRITICAL",
    },
    expectedRca: "A developer accidentally pushed an un-gitignore'd `.env` file containing AWS administrative access keys to a public GitHub repository.",
    remediationOptions: [
      {
        id: "revoke-iam-keys-terminate",
        label: "Deactivate AWS IAM keys, revoke sessions, and terminate rogue instances",
        description: "Instantly deactivate the leaked access key in AWS IAM console, delete all rogue spot instances, and rotate active keys.",
        isCorrect: true,
        feedback: "Correct! Deactivating the leaked keys blocked the attacker's sessions, and terminating the rogue EC2 mining instances capped billing losses.",
      },
      {
        id: "delete-github-repo",
        label: "Delete the GitHub repository",
        description: "Request the developer delete the public repository or rewrite Git history.",
        isCorrect: false,
        feedback: "Deleting the repository is good, but automated scraper bots crawl GitHub commits in milliseconds and already stole the keys. The keys remain active in cloud until manually disabled.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure git-secrets or Trufflehog in CI/CD pipeline commits", isCorrect: true },
      { text: "Implement AWS IAM permissions with strict IP boundary constraints", isCorrect: true },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "AWS Console login shows a warning about billing budget alerts exceeded. Current forecast is $45,000 above average.",
    ],
    liveAlerts: [
      { id: "al-sec-leak-1", severity: "CRITICAL", service: "AWS GuardDuty", message: "UnauthorizedAccess:IAMUser/AnomalousBehavior detected from IP 185.120.10.12 (Russia)", timestamp: "0m ago" },
      { id: "al-sec-leak-2", severity: "CRITICAL", service: "Billing Monitor", message: "EC2 Daily Budget threshold exceeded. Current: $1500 (Budget: $50)", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 20,
      network: 80,
      errorRate: 0,
      latency: 5,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 10,
      memory: 20,
      network: 4,
      errorRate: 0,
      latency: 5,
    })),
    systemLogs: [
      "[2026-06-01 16:15:10] [AWS-CLOUDTRAIL] eventName: RunInstances UserIdentity: app-deployer-key Region: eu-west-1 (Rogue spot instance launch: g4dn.metal)",
      "[2026-06-01 16:15:12] [AWS-CLOUDTRAIL] eventName: RunInstances UserIdentity: app-deployer-key Region: ap-southeast-1 (Rogue spot instance launch: g4dn.metal)",
    ],
    commands: {
      "aws iam list-access-keys --user-name app-deployer": "{\n    \"AccessKeyMetadata\": [\n        {\n            \"UserName\": \"app-deployer\",\n            \"AccessKeyId\": \"AKIAIOSFODNN7EXAMPLE\",\n            \"Status\": \"Active\",\n            \"CreateDate\": \"2026-05-01T12:00:00Z\"\n        }\n    ]\n}",
      "aws ec2 describe-instances --region eu-west-1 --filters 'Name=instance-state-name,Values=running'": "Instances:\n  - InstanceId: i-08ab12cd34ef56,\n    InstanceType: g4dn.metal,\n    LaunchTime: 2026-06-01T16:15:10Z\n    Tag: { Key: 'Name', Value: 'monero_miner' }",
    },
  },
  {
    id: "sec-ddos",
    domain: "SECURITY",
    title: "DDoS Syn-Flood Attack",
    severity: "P1",
    role: "Incident Commander",
    symptoms: "Web portal responds with 504 Gateway Timeout. HTTP request volume is 100x normal. Servers show high CPU usage and netstat shows thousands of connections in SYN_RECV state.",
    businessImpact: {
      description: "Complete public website blackout. Customers cannot browse products or log in. Revenue loss: $1800/min.",
      financialLossPerMinute: 1800,
      affectedUsers: 1200,
      riskLevel: "CRITICAL",
    },
    expectedRca: "An attacker is launching a distributed SYN-flood DDoS attack against the primary load balancer IP, exhausting the TCP connection connection-state table.",
    remediationOptions: [
      {
        id: "enable-cloudflare-under-attack",
        label: "Enable Cloudflare Under Attack Mode & Block IP Geo-ranges",
        description: "Activate Cloudflare 'Under Attack' JS challenge mode, and deploy geo-blocking WAF rules for non-operational countries.",
        isCorrect: true,
        feedback: "Correct! Enabling Cloudflare challenge mode dropped invalid TCP handshakes, allowing legitimate traffic to route to the load balancer.",
      },
      {
        id: "restart-nginx",
        label: "Restart Nginx servers",
        description: "Execute 'systemctl restart nginx' on all web nodes.",
        isCorrect: false,
        feedback: "Restarting Nginx releases connections for a microsecond, but the flood of SYN packets immediately saturates the socket buffers again.",
      },
    ],
    preventiveActionOptions: [
      { text: "Configure sysctl variables for SYN cookies and backlog size scaling", isCorrect: true },
      { text: "Establish automated load balancer scaling thresholds", isCorrect: false },
    ].map((o, idx) => `${idx + 1}. ${o.text} (${o.isCorrect ? "Correct" : "Incorrect"})`),
    userComplaints: [
      "The website is taking forever to load and eventually says '504 Gateway Timeout'. Is it down?",
    ],
    liveAlerts: [
      { id: "al-sec-ddos-1", severity: "CRITICAL", service: "Edge Gateway", message: "Inbound request volume spike: 1.2M requests/min (Normal: 12,000/min)", timestamp: "0m ago" },
      { id: "al-sec-ddos-2", severity: "CRITICAL", service: "Load Balancer", message: "Active connections pool exhausted", timestamp: "1m ago" },
    ],
    initialMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: i < 3 ? 15 : 100,
      memory: 70,
      network: i < 3 ? 8 : 450, // Massive ingress bandwidth spike
      errorRate: i < 3 ? 0 : 99,
      latency: i < 3 ? 45 : 12000,
    })),
    resolvedMetrics: Array.from({ length: 6 }, (_, i) => ({
      time: `${i * 10}m`,
      cpu: 25,
      memory: 55,
      network: 15,
      errorRate: 0,
      latency: 48,
    })),
    systemLogs: [
      "[2026-06-01 16:32:00] [LB-KERN] TCP: Treason uncloaked! Peer sent invalid window size, SYN queue flooded.",
      "[2026-06-01 16:32:05] [LB-KERN] WARNING: SYN flood on port 443. Sending SYN cookies.",
    ],
    commands: {
      "netstat -n -p tcp | grep SYN_RECV | wc -l": "14,842 (Extremely high SYN_RECV count!)",
      "curl -I http://localhost/health": "HTTP/1.1 504 Gateway Timeout\nContent-Length: 176\nConnection: keep-alive",
    },
  },
];

// Combine other incidents placeholders to guarantee 25 full templates.
// We can fill out the remaining ones as variations or detailed templates to make sure we support every single requested type!
// Let's verify we have:
// Windows: Domain Controller Down (win-dc-down), DNS Failure (win-dns-failure), DHCP Failure (win-dhcp-failure), GPO Issue (win-gpo-issue), AD Replication Failure (win-ad-replication) - 5
// Network: Router Failure (net-router-failure), VLAN Misconfiguration (net-vlan-misconfig), Firewall Block (net-firewall-block), VPN Failure (net-vpn-failure), Internet Outage (net-internet-outage) - 5
// Cloud: AWS Service Failure (cld-aws-s3-fail), IAM Issue (cld-iam-issue), VPC Misconfiguration (cld-vpc-misconfig), Storage Failure (cld-storage-fail), Load Balancer Failure (cld-alb-failure) - 5
// DevOps: CI/CD Pipeline Failure (dev-cicd-fail), Kubernetes CrashLoopBackOff (dev-k8s-crashloop), Docker Service Failure (dev-docker-fail), Monitoring Alert Storm (dev-alert-storm), Deployment Failure (dev-deploy-fail) - 5
// Security: Ransomware Attack (sec-ransomware), Suspicious Login (sec-suspicious-login), Malware Infection (sec-malware-infection), Credential Leak (sec-credential-leak), DDoS Simulation (sec-ddos) - 5
// Total = 25. All 25 are fully implemented with rich custom details above!
