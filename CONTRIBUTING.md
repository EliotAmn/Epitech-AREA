# Contributing to AÉRA

Thanks for your interest in contributing! This document describes the preferred workflow and expectations for contributions to this repository.

## Table of Contents

1. How to contribute
2. Branching & naming conventions
3. Pull request process
4. Code style & linters
5. Commit messages
6. Reporting issues
7. Local development guidelines
8. Contact

---

## 1. How to contribute

- Fork the repository (if you don't have push access) and create a feature branch.
- Keep changes small and focused — one logical change per PR.
- Ensure linters and formatters run cleanly before creating a PR.

---

## 2. Branching & naming conventions

Use clear branch names. Examples:

- `feat/<part>/<short-description>` — new features
- `fix/<part>/<short-description>` — bug fixes
- `chore/<part>/<short-description>` — chores, dependency bumps
- `refactor/<part>/<short-description>` — refactors

<part> = `backend`, `web`, `mobile`, or leave empty for cross-cutting changes.

Commit early and often; squash or tidy history before merging if appropriate.

---

## 3. Pull request process

- Open a PR against `dev` from your feature branch.
- Use a descriptive PR title and include a short summary of the changes.
- Link related issues (if any) in the PR description.
- Add reviewers and wait for approvals. At least two approvals are required.
- Ensure CI passes (tests, linting) before merging.

---

## 4. Code style & linters

- Follow the project's ESLint and Prettier configuration.
- Run linters locally and fix warnings/errors before pushing.
- Use TypeScript types where available; avoid `any` unless justified and documented.

Suggested commands (run from the relevant folder):

```bash
npm run lint
npm run format
```

---

## 5. Commit messages

Use concise, meaningful commit messages. Prefer Conventional Commits style:

```
feat(auth): add remember-me option
fix(profile): show real user name
chore(deps): bump axios to 1.3.0
```

---

## 6. Reporting issues

When reporting a bug or enhancement, include:

- A clear title
- Steps to reproduce
- Expected vs actual behavior
- Any relevant logs or screenshots (if applicable)
- Environment (OS, Node version, commands run, if relevant)

---

## 7. Local development guidelines

- Use environment variables and `.env` files for secrets and endpoints. Do not commit secrets to the repo.
- Prefer Docker for running databases and other dependencies locally for parity with CI.
- Keep UI changes small and accessible. Use Tailwind classes already adopted in the codebase.

---

## 8. Contact

If you're unsure where to start, open an issue with the label `good first issue` and a maintainer will help prioritize it.

Thanks for contributing — we appreciate your help making AÉRA better!
