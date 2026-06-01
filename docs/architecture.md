# GuruAI AI Engineer Operating System Architecture

## Runtime
- Frontend: Next.js 15, TypeScript, TailwindCSS, shadcn-style primitives, Framer Motion.
- Backend: FastAPI intelligence service.
- Data: PostgreSQL through Prisma, Redis for cache and short-lived intelligence state.
- Auth: Supabase Auth with Google and GitHub OAuth configured in Supabase dashboard.
- AI: provider router supports OpenAI, Anthropic, and Gemini.

## Core Domains
- Identity: Supabase user identity, local user profile, RBAC roles.
- Learning: tracks, skill graph, prerequisites, mastery, confidence, mistake memory.
- AI Teacher: language, mentor mode, weak/strong topics, learning speed, previous mistakes.
- Labs: Windows, Linux, Cloud, DevOps lab definitions and validation checks.
- Troubleshooting: incident templates, proof steps, RCA evaluation.
- Company Simulation: virtual enterprise estate and live incident missions.
- Projects: generated project templates, milestones, rubric scoring.
- Interview: technical, HR, scenario, voice sessions and feedback.
- Career: resume, ATS score, LinkedIn, readiness, skill gaps.
- Admin: users, labs, AI models, content, analytics, revenue, audit logs.

## Scale Design
- Stateless frontend and FastAPI services.
- PostgreSQL for transactional state, indexed by tenant/user/track/skill.
- Redis for caching AI outputs, rate limits, session memory, and queues.
- AI provider router isolates model vendors from product modules.
- Analytics events are append-only and ready for warehouse export.
- Admin mutations must emit audit logs.
