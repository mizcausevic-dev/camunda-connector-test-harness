import type {
  ConnectorScenario,
  FailureSimulation,
  SecretReplacementCase,
  VerificationCheck
} from "../types.js";
import { HarnessService } from "./harnessService.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function statusClass(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("fail-fast")) return "critical";
  if (normalized.includes("review")) return "review";
  if (normalized.includes("watch") || normalized.includes("retry")) return "watch";
  return "ready";
}

function nav(active: string): string {
  const items = [
    ["overview", "/"],
    ["scenario matrix", "/scenario-matrix"],
    ["secret replacement", "/secret-replacement"],
    ["failure lab", "/failure-lab"],
    ["verification", "/verification"],
    ["docs", "/docs"]
  ];

  return items
    .map(([label, href]) => {
      const isActive = active === label ? "active" : "";
      return `<a class="nav-link ${isActive}" href="${href}">${escapeHtml(label)}</a>`;
    })
    .join("");
}

function metricCard(label: string, value: string, detail: string): string {
  return `
    <article class="panel metric">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value)}</div>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

function signalList(values: string[]): string {
  return `<div class="signal-row">${values
    .map((value) => `<span class="signal">${escapeHtml(value)}</span>`)
    .join("")}</div>`;
}

function reviewList(checks: VerificationCheck[]): string {
  return checks
    .map(
      (check) => `
        <div class="list-row">
          <div>
            <h3>${escapeHtml(check.category)}</h3>
            <div class="meta">${escapeHtml(check.question)}</div>
            <div class="signal-row"><span class="signal">${escapeHtml(check.recommendation)}</span></div>
          </div>
          <div><span class="status ${statusClass(check.status)}">${escapeHtml(check.status)}</span></div>
        </div>
      `
    )
    .join("");
}

function scenarioRows(scenarios: ConnectorScenario[]): string {
  return scenarios
    .map(
      (scenario) => `
        <div class="list-row">
          <div>
            <h3>${escapeHtml(scenario.connectorName)} · ${escapeHtml(scenario.operationName)}</h3>
            <div class="meta mono">${escapeHtml(scenario.endpoint)}</div>
            <div class="meta">${escapeHtml(scenario.expectedOutcome)}</div>
            <div class="signal-row">
              <span class="signal">${escapeHtml(scenario.authModel)}</span>
              <span class="signal">${escapeHtml(scenario.requiredInputs.join(", "))}</span>
            </div>
          </div>
          <div><span class="status ${statusClass(scenario.executionMode)}">${escapeHtml(scenario.executionMode)}</span></div>
        </div>
      `
    )
    .join("");
}

function secretRows(secretCases: SecretReplacementCase[]): string {
  return secretCases
    .map(
      (secretCase) => `
        <tr>
          <td><strong>${escapeHtml(secretCase.key)}</strong><div class="meta mono">${escapeHtml(secretCase.sourcePattern)}</div></td>
          <td>${escapeHtml(secretCase.replacementSource)}</td>
          <td><span class="status ${statusClass(secretCase.status)}">${escapeHtml(secretCase.status)}</span></td>
          <td>${escapeHtml(secretCase.recommendation)}</td>
        </tr>
      `
    )
    .join("");
}

function failureRows(failures: FailureSimulation[]): string {
  return failures
    .map(
      (failure) => `
        <div class="list-row">
          <div>
            <h3>${escapeHtml(failure.scenarioName)}</h3>
            <div class="meta">${escapeHtml(failure.trigger)}</div>
            <div class="meta">${escapeHtml(failure.observedFailure)}</div>
            <div class="signal-row">
              <span class="signal">${escapeHtml(failure.retryPolicy)}</span>
              <span class="signal">${escapeHtml(failure.operatorAction)}</span>
            </div>
          </div>
          <div><span class="status ${statusClass(failure.status)}">${escapeHtml(failure.status)}</span></div>
        </div>
      `
    )
    .join("");
}

export function page(active: string, body: string): string {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Camunda Connector Test Harness</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0a1020;
        --panel: #121a31;
        --line: rgba(255,255,255,0.08);
        --text: #f7fbff;
        --muted: #b6c4de;
        --camunda-blue: #1f6fff;
        --camunda-blue-2: #5b9dff;
        --camunda-teal: #1ed3c6;
        --camunda-amber: #f3b33d;
        --camunda-rose: #fb7185;
        --camunda-green: #4ade80;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, "Segoe UI", system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top right, rgba(31,111,255,0.22), transparent 24%),
          radial-gradient(circle at top left, rgba(30,211,198,0.14), transparent 18%),
          linear-gradient(180deg, #08101d 0%, #0a1020 100%);
      }
      a { color: inherit; text-decoration: none; }
      .shell { max-width: 1460px; margin: 0 auto; padding: 28px; }
      .topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 20px;
        padding: 20px 24px; border-radius: 28px; border: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(18,26,49,0.98), rgba(11,16,32,0.98));
        box-shadow: 0 28px 60px rgba(0,0,0,0.28);
      }
      .brand { display: flex; align-items: center; gap: 14px; }
      .mark {
        width: 50px; height: 50px; border-radius: 16px; display: grid; place-items: center;
        background: linear-gradient(135deg, var(--camunda-blue), var(--camunda-blue-2));
        font-weight: 900; letter-spacing: 0.06em; color: white;
      }
      .brand strong { display: block; font-size: 17px; }
      .brand span { display: block; margin-top: 4px; color: #98d7ff; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
      .nav { display: flex; flex-wrap: wrap; gap: 10px; }
      .nav-link {
        padding: 12px 16px; border-radius: 999px; border: 1px solid var(--line);
        background: rgba(255,255,255,0.03); color: #d2daf0; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
      }
      .nav-link.active { background: linear-gradient(135deg, var(--camunda-blue), var(--camunda-blue-2)); color: white; }
      .hero, .panel {
        border: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(18,26,49,0.96), rgba(11,16,32,0.96));
        box-shadow: 0 22px 54px rgba(0,0,0,0.18);
      }
      .hero { margin-top: 20px; padding: 30px; border-radius: 30px; }
      .panel { border-radius: 26px; }
      .section, .metric { padding: 24px; }
      .eyebrow {
        color: #8fc9ff; font-size: 11px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase;
      }
      h1 {
        margin: 14px 0 14px;
        font-size: clamp(42px, 5vw, 72px);
        line-height: 0.95;
        letter-spacing: -0.05em;
        font-family: Georgia, "Times New Roman", serif;
      }
      h2 {
        margin: 12px 0 10px;
        font-size: 28px;
        line-height: 1.08;
        letter-spacing: -0.03em;
        font-family: Georgia, "Times New Roman", serif;
      }
      h3 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
      p, .meta, td, th, div, span, strong { overflow-wrap: anywhere; }
      p, .meta { color: var(--muted); line-height: 1.6; }
      .callout {
        margin-top: 20px; padding: 18px 20px; border-radius: 18px;
        background: rgba(255,255,255,0.04); border: 1px solid var(--line);
      }
      .callout strong {
        display: block; color: var(--camunda-amber); margin-bottom: 8px;
        font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
      }
      .grid { display: grid; gap: 18px; margin-top: 20px; }
      .grid-four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .grid-two { grid-template-columns: 1fr 1fr; }
      .metric .label { color: #92a9cf; font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
      .metric .value { margin-top: 12px; font-size: 44px; font-weight: 900; letter-spacing: -0.04em; }
      .signal-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
      .signal {
        display: inline-flex; align-items: center; padding: 8px 10px; border-radius: 999px;
        background: rgba(31,111,255,0.14); color: #bed5ff; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
      }
      .status {
        display: inline-flex; align-items: center; justify-content: center; min-width: 92px;
        padding: 8px 12px; border-radius: 999px; font-size: 10px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;
      }
      .status.ready { color: #adf6c5; background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.2); }
      .status.review { color: #ffe29b; background: rgba(243,179,61,0.12); border: 1px solid rgba(243,179,61,0.2); }
      .status.watch { color: #a8f0e9; background: rgba(30,211,198,0.12); border: 1px solid rgba(30,211,198,0.18); }
      .status.critical { color: #ffc2cc; background: rgba(251,113,133,0.14); border: 1px solid rgba(251,113,133,0.2); }
      .list-row {
        padding: 18px 0; border-top: 1px solid rgba(255,255,255,0.06);
        display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start;
      }
      .list-row:first-of-type { border-top: none; }
      .mono { font-family: "Cascadia Code", Consolas, monospace; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 16px 18px; text-align: left; vertical-align: top; }
      thead th {
        color: #92a9cf; font-size: 10px; text-transform: uppercase;
        letter-spacing: 0.16em; border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      tbody tr + tr td { border-top: 1px solid rgba(255,255,255,0.06); }
      .footer {
        margin-top: 18px; color: #9eb0ca; font-size: 12px;
        display: flex; justify-content: space-between; gap: 12px;
      }
      @media (max-width: 1180px) { .grid-four, .grid-two { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 860px) { .grid-four, .grid-two { grid-template-columns: 1fr; } .topbar { display: block; } }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="topbar">
        <div class="brand">
          <div class="mark">CM</div>
          <div>
            <strong>Camunda Connector Test Harness</strong>
            <span>Connector contract validation + failure simulation</span>
          </div>
        </div>
        <div class="nav">${nav(active)}</div>
      </section>
      ${body}
      <div class="footer">
        <span>Contract-test outbound connectors before BPMN variables, secrets, and retries drift into fragile automation.</span>
        <span>Built to make connector validation, failure replay, and secret posture visible in one place.</span>
      </div>
    </main>
  </body>
  </html>`;
}

export function overview(service: HarnessService): string {
  const summary = service.summary();
  return `
    <section class="hero">
      <div class="eyebrow">Camunda connector harness</div>
      <h1>Exercise outbound connectors before secret posture, retries, and variable mappings go sideways.</h1>
      <p>Use this repo to model scenario validation, required-input checks, secret replacement, and failure behavior for Camunda-style outbound connectors.</p>
      <div class="callout">
        <strong>Lead recommendation</strong>
        <span>${escapeHtml(summary.leadRecommendation)}</span>
      </div>
    </section>
    <section class="grid grid-four">
      ${metricCard("Scenario count", String(summary.scenarioCount), "Modeled connector test scenarios in the harness.")}
      ${metricCard("Ready scenarios", String(summary.readyScenarios), "Safe dry-run lanes ready for dispatch validation.")}
      ${metricCard("Secret checks", String(summary.secretReplacementChecks), "Credential replacement cases under review.")}
      ${metricCard("Failure simulations", String(summary.failureSimulations), "Retry, fail-fast, and replay cases in the lab.")}
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <div class="eyebrow">Scenario lanes</div>
        <h2>The harness treats outbound connector tests like operator workflows, not toy mocks.</h2>
        <p>Each scenario pairs the endpoint, auth posture, required inputs, execution mode, and expected outcome so connector behavior stays explainable.</p>
        ${signalList(service.scenarios().map((scenario) => `${scenario.operationName} · ${scenario.executionMode}`))}
      </article>
      <article class="panel section">
        <div class="eyebrow">Verification posture</div>
        <h2>Secret replacement and retry logic stay in the same review surface.</h2>
        <p>That keeps teams from validating the happy path while missing the credential or failure-handling story that actually breaks production connectors.</p>
        ${reviewList(service.verificationChecks())}
      </article>
    </section>
  `;
}

export function scenarioMatrix(service: HarnessService): string {
  return `
    <section class="hero">
      <div class="eyebrow">Scenario matrix</div>
      <h1>See exactly what each connector scenario validates before the worker sends anything downstream.</h1>
      <p>The matrix keeps required inputs, auth posture, execution mode, and expected connector outcomes visible for each modeled test lane.</p>
    </section>
    <section class="grid">
      <article class="panel section">
        <div class="eyebrow">Connector scenarios</div>
        <h2>Test paths are easier to trust when required variables and expected outcomes are explicit.</h2>
        <p>That keeps BPMN variable mapping problems from masquerading as transport or auth failures later.</p>
        ${scenarioRows(service.scenarios())}
      </article>
    </section>
  `;
}

export function secretReplacement(service: HarnessService): string {
  return `
    <section class="hero">
      <div class="eyebrow">Secret replacement</div>
      <h1>Credential handling should fail clearly, not quietly fall back to unsafe defaults.</h1>
      <p>This route tracks whether each connector scenario resolves its secret placeholders through a real source or drifts toward static fallback behavior.</p>
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <div class="eyebrow">Replacement inventory</div>
        <h2>Every credential path gets a visible replacement source and status.</h2>
        <p>That makes it easier to prove the worker is doing secret injection properly before any BPMN process depends on it.</p>
        <table>
          <thead>
            <tr><th>Key</th><th>Replacement source</th><th>Status</th><th>Recommendation</th></tr>
          </thead>
          <tbody>${secretRows(service.secretReplacementCases())}</tbody>
        </table>
      </article>
      <article class="panel section">
        <div class="eyebrow">Policy lane</div>
        <h2>The harness should expose secret posture weaknesses before connector deploy.</h2>
        <p>Static fallback tokens and silent substitution paths should be treated as critical test failures, not convenience features.</p>
        ${signalList(service.secretReplacementCases().map((item) => `${item.key} · ${item.status}`))}
      </article>
    </section>
  `;
}

export function failureLab(service: HarnessService): string {
  return `
    <section class="hero">
      <div class="eyebrow">Failure lab</div>
      <h1>Simulate connector retries, validation stops, and replay-safe operator actions before they hit production workflows.</h1>
      <p>The failure lab keeps trigger, observed behavior, retry policy, and operator action tied together so teams can explain what the connector should do under stress.</p>
    </section>
    <section class="grid">
      <article class="panel section">
        <div class="eyebrow">Simulation matrix</div>
        <h2>Failure handling matters as much as the happy-path connector response.</h2>
        <p>Retryable downstream errors, validation failures, and rate-limit bursts should not all collapse into the same behavior.</p>
        ${failureRows(service.failureSimulations())}
      </article>
    </section>
  `;
}

export function verification(service: HarnessService): string {
  const readyChecks = service.verificationChecks().filter((check) => check.status === "ready").length;
  const reviewChecks = service.verificationChecks().filter((check) => check.status === "review").length;

  return `
    <section class="hero">
      <div class="eyebrow">Verification</div>
      <h1>What the harness proves about connector safety, secret discipline, and failure replay right now.</h1>
      <p>The current snapshot shows whether the connector lane is validating required inputs, handling secrets safely, and separating retryable problems from fail-fast conditions.</p>
    </section>
    <section class="grid grid-four">
      ${metricCard("Mapped scenarios", String(service.scenarios().length), "Connector lanes already modeled in the harness.")}
      ${metricCard("Ready checks", String(readyChecks), "Verification lanes already in the green posture.")}
      ${metricCard("Review checks", String(reviewChecks), "Controls that still deserve manual scrutiny.")}
      ${metricCard("Critical secret cases", String(service.secretReplacementCases().filter((item) => item.status === "critical").length), "Credential paths that should fail the build or review gate.")}
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <div class="eyebrow">Snapshot posture</div>
        <h2>The harness is strongest when validation, secrets, and retries remain visible together.</h2>
        <p>That makes the repo useful to workflow engineers, platform teams, and reviewers who need to understand connector behavior before rollout.</p>
        ${signalList([
          `${readyChecks} ready`,
          `${reviewChecks} review`,
          `${service.failureSimulations().length} failure simulations`
        ])}
      </article>
      <article class="panel section">
        <div class="eyebrow">Control checks</div>
        <h2>Verification stays focused on contract quality and safe connector behavior.</h2>
        <p>The point is not just making test calls pass. It is proving why a scenario should retry, halt, or escalate.</p>
        ${reviewList(service.verificationChecks())}
      </article>
    </section>
  `;
}

export function docs(): string {
  return `
    <section class="hero">
      <div class="eyebrow">Docs</div>
      <h1>Route and payload map for the Camunda connector test harness.</h1>
      <p>The HTML routes explain the harness visually. The JSON routes expose the same scenario, secret, failure, and verification payloads for tests and automation.</p>
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <div class="eyebrow">HTML surfaces</div>
        <h2>The repo keeps connector testing legible from several angles.</h2>
        <div class="list-row"><div><h3>Overview</h3><div class="meta mono">GET /</div></div></div>
        <div class="list-row"><div><h3>Scenario matrix</h3><div class="meta mono">GET /scenario-matrix</div></div></div>
        <div class="list-row"><div><h3>Secret replacement</h3><div class="meta mono">GET /secret-replacement</div></div></div>
        <div class="list-row"><div><h3>Failure lab</h3><div class="meta mono">GET /failure-lab</div></div></div>
        <div class="list-row"><div><h3>Verification</h3><div class="meta mono">GET /verification</div></div></div>
      </article>
      <article class="panel section">
        <div class="eyebrow">JSON APIs</div>
        <h2>The same harness state is available as machine-readable payloads.</h2>
        <div class="list-row"><div><h3>Summary</h3><div class="meta mono">GET /api/dashboard/summary</div></div></div>
        <div class="list-row"><div><h3>Scenarios</h3><div class="meta mono">GET /api/scenarios</div></div></div>
        <div class="list-row"><div><h3>Secret cases</h3><div class="meta mono">GET /api/secret-replacement</div></div></div>
        <div class="list-row"><div><h3>Failure simulations</h3><div class="meta mono">GET /api/failure-simulations</div></div></div>
        <div class="list-row"><div><h3>Verification + snapshot</h3><div class="meta mono">GET /api/verification-checks · GET /api/sample</div></div></div>
      </article>
    </section>
  `;
}
