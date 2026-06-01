export interface FallbackParams {
  topic: string;
  question: string;
  mode: string;
  language: string;
}

export function getTeacherFallback({ topic, question, mode, language }: FallbackParams): string {
  const isHinglish = language.toLowerCase() === "hinglish";
  const isHindi = language.toLowerCase() === "hindi";
  const isStrict = mode.toLowerCase() === "strict mentor";
  const isInterviewer = mode.toLowerCase() === "interviewer";
  const isCorporate = mode.toLowerCase() === "corporate mentor";

  // Clean the topic string for matching
  const cleanTopic = topic.toLowerCase();

  if (cleanTopic.includes("dns") || cleanTopic.includes("dhcp") || cleanTopic.includes("name resolution")) {
    return getDnsDhcpFallback(question, isHinglish, isHindi, isStrict, isInterviewer, isCorporate);
  }

  if (cleanTopic.includes("linux") || cleanTopic.includes("command line") || cleanTopic.includes("cli")) {
    return getLinuxCliFallback(question, isHinglish, isHindi, isStrict, isInterviewer, isCorporate);
  }

  // Default: Windows endpoint triage or generic
  return getWindowsTriageFallback(topic, question, isHinglish, isHindi, isStrict, isInterviewer, isCorporate);
}

function getDnsDhcpFallback(
  question: string,
  isHinglish: boolean,
  isHindi: boolean,
  isStrict: boolean,
  isInterviewer: boolean,
  isCorporate: boolean
): string {
  let intro = "";
  if (isStrict) {
    intro = isHinglish 
      ? "Attention! DNS aur DHCP troubleshooting basic nahi hai, ye enterprise network ki backbone hai. Agar isme flow galat hua to complete outage ho jayegi. Let's analyze your question: \"" + question + "\". Aur bina deep analysis ke jump mat karna fix pe.\n\n"
      : "Listen closely. DNS and DHCP troubleshooting is not a school-level game. If you fail to map the layers, you will cause a company-wide outage. Let's break down your question: \"" + question + "\".\n\n";
  } else if (isInterviewer) {
    intro = "As an interviewer, I want to see if you can isolate the layers of name resolution. Here is how I evaluate your question: \"" + question + "\". Let's run through the full engineering drill.\n\n";
  } else if (isCorporate) {
    intro = "From a business perspective, DNS outages equal immediate revenue loss. Regarding your inquiry: \"" + question + "\", here is the enterprise-standard playbook we follow at top MSPs and AWS Cloud Support.\n\n";
  } else {
    intro = "Hey there! Let's dive deep into DNS & DHCP troubleshooting. We will address your question: \"" + question + "\" by mapping out the entire operational system.\n\n";
  }

  return `${intro}=================================================
1. TOPIC OVERVIEW: DNS & DHCP TROUBLESHOOTING (ENTERPRISE)
=================================================
DNS (Domain Name System) translate domain names ko IP addresses mein karta hai, aur DHCP (Dynamic Host Configuration Protocol) systems ko dynamically IP configuration assigns karta hai. Dono ke bina client endpoints target environments se communicate nahi kar sakte.

=================================================
2. LEARNING OBJECTIVES
=================================================
- Master root-cause isolation between DHCP leasing vs DNS resolution.
- Read and analyze client configuration (ipconfig, ifconfig, resolv.conf).
- Troubleshoot zone delegation, recursion, and DNS caching issues.

=================================================
3. REAL WORLD SCENARIO: Active Directory Domain Controller Access Failure
=================================================
Ek corporate user network update ke baad local domain controllers par log in nahi kar pa raha hai. User internal applications (.local domain) aur external tools dono access nahi kar pa raha. IP level reachability (ping 8.8.8.8) fully operational hai, validation points confirm interface is active.

=================================================
4. THEORY & 5. INTERNAL WORKING
=================================================
DNS Query Internals (What happens under the hood when a query is fired):

Step 1: Application (e.g., Browser) checks local memory space / application cache.
Step 2: OS Resolver checks local cache (DNS Resolver Cache).
Step 3: OS reads local Hosts file (%SystemRoot%\\System32\\drivers\\etc\\hosts).
Step 4: If not found, OS Client Resolver fires a UDP/53 (or TCP/53 for large responses) request to the configured Local DNS server.
Step 5: Local DNS Server (Recursive Resolver) queries root servers (".") for Authoritative NS records.
Step 6: Root servers delegate to Top Level Domain (TLD) server (e.g., ".com").
Step 7: TLD server delegates to Authoritative DNS servers.
Step 8: Authoritative server resolves name to IP and returns IP to Recursive Server with TTL (Time-To-Live).
Step 9: Recursive Resolver caches it, returns IP to client.
Step 10: Client establishes socket connection.

=================================================
6. ARCHITECTURE DIAGRAM
=================================================
+-------------------+      (1) Queries       +------------------------+
|  Client Endpoint  | ---------------------> | Local Recursive Server |
|   (10.10.12.45)   | <--------------------- |      (10.10.10.10)     |
+-------------------+      (10) Returns IP   +------------------------+
                                                        |
                                                        | Recursive Queries
                                                        v
                                             +--------------------+
                                             | Root Server (.)    |
                                             +--------------------+
                                                        |
                                                        v
                                             +--------------------+
                                             | TLD Server (.com)  |
                                             +--------------------+
                                                        |
                                                        v
                                             +--------------------+
                                             | Authoritative NS   |
                                             +--------------------+

=================================================
7. PRACTICAL EXAMPLES & 8. COMMAND EXAMPLES
=================================================
Windows Command line validation drills:
- Check configured servers:
  > ipconfig /all
- Clear local resolver cache:
  > ipconfig /flushdns
- Force manual lookup against specific corporate DNS server:
  > nslookup internal-app.company.local 10.10.10.10
- Trace DNS resolution route:
  > nslookup -type=ns company.local

Linux Client validation:
- Check current resolver:
  $ cat /etc/resolv.conf
- Perform lookup:
  $ dig @10.10.10.10 internal-app.company.local

=================================================
9. CONFIGURATION EXAMPLES
=================================================
Typical BIND9 DNS Zone configuration snippet:
\`\`\`text
$TTL 86400
@   IN  SOA ns1.company.local. admin.company.local. (
        2026060101 ; Serial
        3600       ; Refresh
        1800       ; Retry
        604800     ; Expire
        86400 )    ; Minimum TTL
; Name servers
@   IN  NS  ns1.company.local.
; A Records
ns1 IN  A   10.10.10.10
db  IN  A   10.10.10.20
\`\`\`

=================================================
10. LAB EXERCISE (HANDS-ON)
=================================================
- Task: Isolate and recover an endpoint from a broken DNS server configuration.
- Verification Steps:
  1. Ping 8.8.8.8 to verify Layer 3 connectivity.
  2. Run 'nslookup google.com' - observe if it times out.
  3. Edit '/etc/resolv.conf' or adapter properties to use a valid resolver.
- Expected Output:
  nslookup yields: "Non-authoritative answer: Name: google.com Address: 142.250.190.46"
- Failure Scenarios: IP conflict or misconfigured gateway.
- Recovery Steps: Run 'ipconfig /release' and 'ipconfig /renew' to acquire clean settings from DHCP.

=================================================
11. TROUBLESHOOTING GUIDE & 12. COMMON ERRORS
=================================================
Case Study: AD login failures.
- Symptom: Clients cannot contact domain controllers.
- Diagnosis:
  1. Ping the Domain Controller by IP: Succeeds.
  2. Ping the Domain Controller by FQDN: Fails with "Host not found".
  3. Diagnostic query: Run 'nslookup -type=SRV _ldap._tcp.dc._msdcs.company.local'.
  4. Root Cause: Client is using home DNS (e.g., 192.168.1.1) instead of the AD DNS server (10.10.10.10).
  5. Resolution: Fix the DHCP Scope options to hand out 10.10.10.10 as the primary resolver.

Common Errors:
- "NXDOMAIN": The domain does not exist. Solution: Check spelling or verify record propagation.
- "SERVFAIL": The DNS server encountered an internal error. Solution: Verify zone file syntax or root hints configuration on the resolver.

=================================================
13. BEST PRACTICES & 14. SECURITY CONSIDERATIONS
=================================================
- Redundancy: Always configure at least two Recursive DNS resolvers for high availability.
- DNSSEC: Enable DNS Security Extensions to prevent cache poisoning attacks.
- Firewalls: Restrict outbound DNS queries (UDP/53) to authorized resolvers only.

=================================================
15. INTERVIEW QUESTIONS & 16. SCENARIO-BASED QUESTIONS
=================================================
- Q: What is the difference between a recursive and an authoritative DNS server?
  - A: A recursive resolver queries other servers to find the IP address. An authoritative DNS server holds the actual mapping records and provides the final answer.
- Q: A user has an IP address of 169.254.12.8. What does this indicate?
  - A: It is an APIPA (Automatic Private IP Addressing) address, meaning the device failed to reach a DHCP server and self-assigned a non-routable address.

=================================================
17. MINI PROJECT
=================================================
Build a local caching-only DNS server using Unbound or BIND9 inside a Docker container, configure your local development machine to use it as the primary resolver, and measure query times before and after caching.

=================================================
18. MASTERY TEST (QUICK EXAM)
=================================================
1. Which command clears the OS resolver cache on Windows?
   a) ipconfig /renew
   b) ipconfig /flushdns (Correct)
   c) netstat -a
2. Which DNS record type routes mail traffic?
   a) A
   b) MX (Correct)
   c) TXT

=================================================
19. REVISION NOTES & 20. CHEAT SHEET
=================================================
- UDP 53 is used for standard queries under 512 bytes.
- TCP 53 is used for zone transfers and large responses.
- APIPA range is 169.254.0.1 - 169.254.255.254.
- Hosts file override takes priority over network DNS lookups.`;
}

function getLinuxCliFallback(
  question: string,
  isHinglish: boolean,
  isHindi: boolean,
  isStrict: boolean,
  isInterviewer: boolean,
  isCorporate: boolean
): string {
  let intro = "";
  if (isStrict) {
    intro = isHinglish 
      ? "Suno dhyan se! Linux CLI controls pure industry standards (Servers, Cloud, DevOps). Agar tum files aur commands ko execute karte waqt target layout, flags aur permissions nahi jante, to database process ko corrupt kar doge. Your query: \"" + question + "\". Let's dissect this with production logic.\n\n"
      : "Listen. The Linux CLI is the operating center of modern cloud servers. If you execute random commands without knowing flags or file descriptors, you will wipe out a system directory. Let's analyze your question: \"" + question + "\".\n\n";
  } else if (isInterviewer) {
    intro = "In interviews, I evaluate a candidate's mastery of stream redirects, system logs, and permission masking. Let's trace your question: \"" + question + "\" using real Linux internals.\n\n";
  } else if (isCorporate) {
    intro = "For server environments, GUI is a luxury we don't have. Commands must be lightweight, safe, and easily scriptable. Let's address: \"" + question + "\" with standard server guidelines.\n\n";
  } else {
    intro = "Let's explore Linux CLI operations and address your inquiry: \"" + question + "\" like systems engineers.\n\n";
  }

  return `${intro}=================================================
1. TOPIC OVERVIEW: LINUX CLI OPERATIONS & SHELL BASICS
=================================================
Linux CLI (Command Line Interface) systems engineers ko raw system capabilities (file systems, processes, streams, permissions) control karne deta hai without GUI overheads.

=================================================
2. LEARNING OBJECTIVES
=================================================
- Master absolute vs relative paths, stream redirections (stdout, stderr).
- Understand Linux file permission model (ugo/rwx) and octal notation.
- Track running processes and manage resources (ps, top, kill, lsof).

=================================================
3. REAL WORLD SCENARIO: Deployment Script Permission and Execution Denied
=================================================
Ek automated deployment pipeline step execute nahi ho raha kyuki process/runner user script ko execute nahi kar paa raha. System output return kar raha hai: "Permission denied".

=================================================
4. THEORY & 5. INTERNAL WORKING
=================================================
Linux System Permissions Internals:
- Linux maps files to specific User (Owner), Group, and Others (U-G-O).
- Har user target structure ke paas Read (4), Write (2), and Execute (1) permissions hoti hai.
- File systems (Ext4/XFS) store this metadata inside an Inode structure.
- When an execution file request is sent, the kernel checks the executing Process UID/GID against the target Inode permission bits before loading it into memory.

=================================================
6. ARCHITECTURE DIAGRAM (LINUX PROCESS & STREAMS)
=================================================
                +-----------------------------------------+
                |              Shell / Terminal           |
                +-----------------------------------------+
                    | (0: stdin)           ^ (1: stdout)
                    v                      |
            +---------------+      +-------------------------+
            | Linux Process | ---> | Log File / Output files | (Redirection '>')
            +---------------+      +-------------------------+
                    |
                    +------------> | Console / Error log     | (2: stderr redirection)
                           (2)
=================================================
7. PRACTICAL EXAMPLES & 8. COMMAND EXAMPLES
=================================================
File and directory listings:
- View permissions:
  $ ls -la
- Change ownership to deployment user:
  $ sudo chown deploy:deploy-group run-pipeline.sh
- Apply minimum safe executable permissions:
  $ chmod 755 run-pipeline.sh
- Search processes binding port 80:
  $ sudo lsof -i :80

=================================================
9. CONFIGURATION EXAMPLES
=================================================
Permissions mapping breakdown table:
- 755 -> rwxr-xr-x (Owner can read/write/execute; Group & others can read/execute).
- 600 -> rw------- (Owner can read/write; Group & others have zero access).

=================================================
10. LAB EXERCISE (HANDS-ON)
=================================================
- Task: Secure a shell script and run it dynamically using pipeline permissions.
- Verification Steps:
  1. Create file: 'touch test.sh'
  2. Write standard echo: 'echo "echo Hello" > test.sh'
  3. Try running: './test.sh' (Expected: permission denied)
  4. Fix: 'chmod +x test.sh'
  5. Run: './test.sh'
- Expected Output:
  Prints "Hello" to stdout.
- Failure Scenarios: Running command as root and locking ownership.
- Recovery Steps: 'sudo chown $USER:$USER test.sh'.

=================================================
11. TROUBLESHOOTING GUIDE & 12. COMMON ERRORS
=================================================
Case Study: Process locked by unknown user.
- Symptom: Server port is already in use.
- Diagnosis:
  1. Query: Run 'sudo netstat -tulpn | grep 8080' or 'sudo lsof -i :8080'.
  2. Extract PID (e.g., 40552).
  3. Inspect what process it is: 'ps -ef | grep 40552'.
  4. Kill target process gracefully: 'kill 40552'. If hung, force kill: 'kill -9 40552'.

=================================================
13. BEST PRACTICES & 14. SECURITY CONSIDERATIONS
=================================================
- Principle of Least Privilege: Never use 'chmod 777' on files. Use '755' for scripts and '644' for static configuration.
- SSH: Always disable root logins via SSH in '/etc/ssh/sshd_config'.

=================================================
15. INTERVIEW QUESTIONS & 16. SCENARIO-BASED QUESTIONS
=================================================
- Q: What does '2>&1' mean in a shell command?
  - A: It redirects standard error (2) to standard output (1), allowing logs to capture both standard prints and errors in a single stream.
- Q: What is the difference between soft links and hard links?
  - A: A soft link is a pointer to the path name of a file. A hard link is a pointer directly to the inode index, maintaining the data even if the original name is deleted.

=================================================
17. MINI PROJECT
=================================================
Write a clean bash script that checks the CPU and disk usage, logs the outputs to a dated file, and automatically archives old files if directory space is low.

=================================================
18. MASTERY TEST
=================================================
1. Which command displays the absolute path of the current directory?
   a) cd
   b) pwd (Correct)
   c) ls
2. How do you force terminate a hung process with PID 1024?
   a) kill 1024
   b) kill -9 1024 (Correct)
   c) stop 1024

=================================================
19. REVISION NOTES & 20. CHEAT SHEET
=================================================
- 'chmod 755' is read/write/execute for owner, read/execute for others.
- 'grep' searches text patterns; 'awk' parses structured columns.
- 'top' / 'htop' shows real-time process telemetry.
- '$?' fetches the exit status of the previously executed command.`;
}

function getWindowsTriageFallback(
  topic: string,
  question: string,
  isHinglish: boolean,
  isHindi: boolean,
  isStrict: boolean,
  isInterviewer: boolean,
  isCorporate: boolean
): string {
  let intro = "";
  if (isStrict) {
    intro = isHinglish 
      ? "Suno! Windows triage simple system reboot nahi hai. Hame Event Viewer, Services manager aur local logs ko analyze karna seekhna hoga. Here is how a Principal Engineer solves: \"" + question + "\". Focus on the facts.\n\n"
      : "Windows triage is not about re-imaging machines. It is about logical isolation of services and configurations. Let's analyze your question: \"" + question + "\".\n\n";
  } else if (isInterviewer) {
    intro = "Let's review your question \"" + question + "\" from an interviewer's perspective to see if you possess true system engineer insights.\n\n";
  } else {
    intro = "Here is a senior engineer analysis regarding \"" + question + "\" under topic \"" + topic + "\".\n\n";
  }

  return `${intro}=================================================
1. TOPIC OVERVIEW: WINDOWS ENDPOINT TRIAGE & TROUBLESHOOTING
=================================================
Windows triage covers client machines, boot repairs, application crash dumps, system service states, registry flags, and domain authentication configurations.

=================================================
2. LEARNING OBJECTIVES
=================================================
- Master event isolation using Windows Event Viewer logs.
- Learn dynamic process/service isolation (sc query, tasklist, Task Manager).
- Triage domain joins and network trust issues.

=================================================
3. REAL WORLD SCENARIO: Local System Registry & Service Crash
=================================================
Ek domain-joined windows worker machine security update installation ke baad boot crash loop mein phas chuki hai, ya services load nahi ho rahi hain. User domain account se authenticate nahi kar paa raha.

=================================================
4. THEORY & 5. INTERNAL WORKING
=================================================
Windows Boot & Auth Cycle:
- UEFI executes Windows Boot Manager -> Winload.efi -> Kernel (ntoskrnl.exe).
- Kernel loads drivers classified as BOOT_START in registry.
- LSASS.exe (Local Security Authority Subsystem Service) executes to authenticate local and Active Directory logins.
- If a security driver crashes or LSASS fails to load, Windows halts execution and triggers a Blue Screen (BSOD) or halts login processes.

=================================================
6. ARCHITECTURE DIAGRAM
=================================================
+--------------+       (Starts)        +------------------+
|   UEFI/BIOS  | ------------------->  | Windows Boot Mgr |
+--------------+                       +------------------+
                                                |
                                                v
+--------------+     (Authenicates)    +------------------+
|  LSASS.exe   | <-------------------  |  System Kernel   |
+--------------+                       +------------------+
                                       (ntoskrnl.exe)

=================================================
7. PRACTICAL EXAMPLES & 8. COMMAND EXAMPLES
=================================================
Windows Command Prompt diagnostics:
- Check health of system files:
  > sfc /scannow
- Query status of specific service (e.g., DNS client):
  > sc query Dnscache
- Restart a service:
  > net stop Dnscache && net start Dnscache
- View active network bindings:
  > netstat -ano | findstr 3389

=================================================
9. CONFIGURATION EXAMPLES
=================================================
Active Directory Secure Channel repair command:
\`\`\`cmd
nltest /sc_verify:company.local
\`\`\`
If trust is broken, repair with:
\`\`\`cmd
nltest /sc_reset:company.local
\`\`\`

=================================================
10. LAB EXERCISE (HANDS-ON)
=================================================
- Task: Identify and restart a crashed print spooler service.
- Verification Steps:
  1. Open Command Prompt as Administrator.
  2. Run: 'sc query Spooler' (Notice if status is STOPPED).
  3. Start service: 'net start Spooler'.
  4. Recheck query status.
- Expected Output:
  "SERVICE_NAME: Spooler TYPE: 10 WIN32_OWN_PROCESS STATUS: 4 RUNNING"
- Failure Scenarios: Service fails to start due to corrupted driver files.
- Recovery Steps: Reinstall printer drivers or clear directories under System32\\spool\\PRINTERS\\.

=================================================
11. TROUBLESHOOTING GUIDE & 12. COMMON ERRORS
=================================================
Case Study: Trust relationship between client workstation and AD domain controller failed.
- Symptom: User cannot login using corporate credentials.
- Diagnosis:
  1. Login using a local administrator account.
  2. Run 'nltest /sc_query:domain_name'.
  3. Result displays error code 1355 or trust validation failure.
  4. Fix: Run 'Reset-ComputerMachinePassword' in PowerShell, or rejoin the machine to the Active Directory domain.

=================================================
13. BEST PRACTICES & 14. SECURITY CONSIDERATIONS
=================================================
- Principle of Least Privilege: Do not log into client systems using Domain Admin credentials, as this leaves tickets/hashes in LSASS memory vulnerable to Mimikatz extraction.
- Updates: Always test patches on a pilot group before deploying to production endpoints.

=================================================
15. INTERVIEW QUESTIONS & 16. SCENARIO-BASED QUESTIONS
=================================================
- Q: Where does Windows write application crash records?
  - A: In Event Viewer under Windows Logs -> Application. System errors are written in Windows Logs -> System.
- Q: How do you check which PID is listening on port 443 on Windows?
  - A: Run 'netstat -ano | findstr :443' and identify the PID in the far right column.

=================================================
17. MINI PROJECT
=================================================
Create a PowerShell monitoring script that checks the status of essential Windows services (Dhcp, Dnscache, Winrm) every 5 minutes and writes an alert event to the Windows Application Log if any service is down.

=================================================
18. MASTERY TEST
=================================================
1. Which command verifies domain controller connection integrity?
   a) ipconfig /all
   b) nltest /sc_verify:domain (Correct)
   c) net share
2. Which built-in tool is used to monitor real-time resource allocations?
   a) Event Viewer
   b) Resource Monitor (Correct)
   c) Disk Manager

=================================================
19. REVISION NOTES & 20. CHEAT SHEET
=================================================
- 'sfc /scannow' repairs system files. 'DISM.exe /Online /Cleanup-image /Restorehealth' fixes the component store.
- Windows Event logs are saved as .evtx files in '%SystemRoot%\\System32\\Winevt\\Logs\\'.
- 'sc config [ServiceName] start= auto' configures service startup type to automatic.`;
}
