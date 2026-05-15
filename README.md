# camunda-connector-test-harness

TypeScript harness for contract-testing Camunda outbound connectors with secret replacement, retry simulation, and failure review.

## Why this repo exists

Outbound connector demos usually prove one happy path and stop there. Real connector work fails on variable mapping, missing required inputs, hard-coded secret fallbacks, and retry logic that cannot explain why it replayed or stopped. This repo turns those concerns into an operator-facing test harness.

## What it proves

- TypeScript and Node coverage in the workflow automation lane
- Camunda-flavored connector scenarios with required-input and auth posture visibility
- Secret replacement checks that surface unsafe fallback behavior
- Failure lab for retry, fail-fast, and replay-safe operator actions

## Screenshots

![Overview proof](./screenshots/01-overview-proof.png)
![Scenario matrix proof](./screenshots/02-scenario-matrix-proof.png)
![Secret replacement proof](./screenshots/03-secret-replacement-proof.png)
![Verification proof](./screenshots/04-verification-proof.png)

## Routes

### HTML

- `/`
- `/scenario-matrix`
- `/secret-replacement`
- `/failure-lab`
- `/verification`
- `/docs`

### JSON

- `/api/dashboard/summary`
- `/api/scenarios`
- `/api/secret-replacement`
- `/api/failure-simulations`
- `/api/verification-checks`
- `/api/sample`
- `/api/health`

## Run locally

```powershell
Set-Location "C:\Users\chaus\dev\repos\camunda-connector-test-harness"
npm install
npm run dev
```

Open [http://127.0.0.1:5124/](http://127.0.0.1:5124/).

## Validate

```powershell
npm run build
npm run test
npm run demo
npm run smoke
npm run render:assets
```

## Docs

- [Architecture](./docs/architecture.md)
- [Origin](./docs/ORIGIN.md)
- [Changelog](./CHANGELOG.md)
