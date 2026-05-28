# Changelog

All notable changes to `camunda-connector-test-harness` are documented in this file.

## [1.1.0] - 2026-05-28

### Changed

- **Visual overhaul of every HTML route.** Pulled in the Gemini-built reference design: Instrument Serif headlines with italic accent words, JetBrains Mono labels with leading colored dots, brighter Camunda-blue brand with subtle glow, inline SVG icons (no external icon runtime), terminal-style endpoint code blocks, depth via gradients + grid backdrop, and a brighter execution-trace diagram on the overview.
- Status pills now carry leading per-status SVG icons (ready check, review circle-tick, watch arc, critical triangle) instead of color-only differentiation.
- Scenario rows now render the operation name in Camunda-blue monospace, the endpoint inside a styled code block, and the auth/required-input as mono chips.
- Added OG / Twitter / theme-color meta on every route for share-card rendering on LinkedIn / Slack / Mastodon.
- Route titles now include the lane name (e.g. `Scenario Matrix · Camunda Connector Test Harness`).

### Captured

- All four README screenshots re-rendered against the new design (`scripts/render_readme_assets.ps1`).

### Preserved

- All routes, JSON APIs, business logic, data shapes, and tests. No `src/services/harnessService.ts` or `src/data` edits — the visual change is rendering-only.

## [1.0.0] - 2026-05-15

### Added

- Public TypeScript harness for Camunda-style outbound connector contract testing
- HTML surfaces for overview, scenario matrix, secret replacement, failure lab, verification, and docs
- JSON APIs for scenario lanes, secret posture, failure simulations, and verification checks
- Real browser-rendered README proof captures with route-specific viewport sizing

### Framing

- Positioned the repo as workflow and connector infrastructure rather than another generic dashboard
- Kept required-input validation, secret replacement, and retry discipline visible in one control surface

## [0.1.0] - 2026-02-28

### Prototype

- Modeled the first scenario set around connector validation, required-input enforcement, and retry simulation
- Split lanes into dry-run, manual review, retry queued, and fail-fast outcomes

## [0.0.5] - 2025-10-02

### Design

- Chose a harness-first framing so the repo would read like reusable workflow tooling instead of a single connector demo
- Broke the system into scenario, secret, failure, and verification surfaces for easier operator review

## [0.0.2] - 2024-07-18

### Research

- Cataloged the connector failure modes teams repeatedly hit in workflow automation: brittle variable mapping, static secret fallbacks, confusing retry behavior, and weak replay stories
- Mapped those issues to the kinds of review controls platform teams already expect in deployment and integration tooling

## [0.0.1] - 2023-04-26

### Idea origin

- Recognized that connector examples were good at showing payload shape but weak at showing why a scenario should halt, retry, or escalate
- Started treating connector validation as an operational control problem rather than a pure SDK problem
