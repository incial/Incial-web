# CLAUDE.md

This repository's canonical engineering rules, security guardrails, database/S3 safety policies, branching workflow, and sub-agent rules live in [`AGENTS.md`](AGENTS.md).

@AGENTS.md

## Claude-Specific Notes

- **Neon Postgres Skill**: Reference [`.claude/skills/neon-postgres/SKILL.md`](.claude/skills/neon-postgres/SKILL.md) when planning Neon branch workflows, connection pooling, or driver changes.
- **Never Inspect Secrets**: Do not read `.env` or `.env.local`; inspect [`.env.example`](.env.example) for variable names and expected formats.
- **Sub-Agents**: Enforce disjoint file ownership across parallel sub-agents and re-run `pnpm typecheck` and `pnpm lint` (plus `pnpm build` for route/config/schema changes) after integrating sub-agent edits.
