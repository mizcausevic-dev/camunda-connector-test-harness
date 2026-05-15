# Changelog

All notable changes to `camunda-connector-test-harness` are documented in this file.

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
