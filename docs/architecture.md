# Architecture

## Overview

`camunda-connector-test-harness` is a TypeScript and Express reference app for modeling how outbound connectors should be tested before they are trusted inside workflow automation. The repo is built to answer two questions quickly:

1. What does this connector scenario require and expect?
2. If it fails, can we explain whether it should retry, stop, or escalate?

## Runtime shape

- `src/app.ts`
  - Creates the Express app and maps both HTML and JSON routes.
- `HarnessService`
  - Aggregates connector scenarios, secret replacement cases, failure simulations, and verification checks into one consistent snapshot.
- `render.ts`
  - Renders the Camunda-inspired control surfaces for overview, scenario matrix, secret replacement, failure lab, verification, and docs.
- `sampleData.ts`
  - Supplies deterministic connector test cases for the UI, APIs, tests, and screenshots.

## Control lanes

The harness is organized across four review lanes:

- connector scenarios
- secret replacement posture
- failure simulations
- verification checks

That separation makes it easier to inspect:

- whether required connector inputs are enforced before dispatch
- whether credentials resolve through safe placeholders
- whether retry behavior is actually appropriate for the failure type
- whether operators can explain what happened after a replay

## Proof strategy

README screenshots are captured from the real running app with route-specific viewport sizes. That keeps the proof layer balanced and avoids dead space or overflow when route content density changes.
