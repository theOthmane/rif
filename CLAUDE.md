# CLAUDE.md — RIFANO session protocol

This is the session entry point. Project truth is not duplicated here:

- `AGENTS.md` — rules, OS 2.0 architecture, gates, workflow, progress.
- `PRODUCT.md` — product, market, commerce and brand facts.
- `DESIGN.md` — visual system; token values live in `theme/assets/tokens.css`.
- `STATUS.md` — what is done, in progress, next, and still open.
- `DECISIONS.md` — design/tech decision log, newest first.

Read `AGENTS.md` in full before any theme work. If this file and `AGENTS.md`
disagree, `AGENTS.md` wins.

## Session rules

### At session start

1. Read `STATUS.md` and `DECISIONS.md` before touching code.
2. Read `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, and the spec for the task.
3. Check `git status` and the current branch. Do not build on uncommitted
   work you cannot identify.

### At session end

1. Update `STATUS.md`: move finished work to Done, record what is awaiting
   approval, and trim stale lines.
2. Add every new design/tech decision to `DECISIONS.md`, newest on top:
   date, decision, why, what it rules out.
3. Commit with a clear message (repo convention: `feat(NN): …`, `fix(NN): …`,
   or `docs: …`).
4. Push the dev branch to origin (currently `redesign/taste-v2`).

### Conflict rule

Never silently contradict `DECISIONS.md`. If a requested change conflicts
with a logged decision, stop and ask the owner before implementing it.

## Scope guard

This protocol governs docs only. Theme changes still follow `AGENTS.md` §6:
one spec per session, Gate A (`theme check`), Gate B (push smoke), Gate C
(visual QA at 375/768/1440).
