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

function statusIcon(cls: string): string {
  if (cls === "critical")
    return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1.5 14.5 13H1.5L8 1.5Z"/><path d="M8 6.5v3"/><circle cx="8" cy="11.4" r="0.6" fill="currentColor"/></svg>`;
  if (cls === "review")
    return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8.5 7.5 10.5 11 6"/></svg>`;
  if (cls === "watch")
    return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 8a6 6 0 1 1-2-4.5"/><path d="M14 2v3.5h-3.5"/></svg>`;
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 8.4 3.4 3.2L13 5"/></svg>`;
}

function pillStatus(value: string): string {
  const cls = statusClass(value);
  return `<span class="status ${cls}"><span class="status-ic">${statusIcon(cls)}</span>${escapeHtml(value)}</span>`;
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

const FEATURE_ICONS: Record<string, string> = {
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 4.9 3.4 8.6 8 9.5 4.6-.9 8-4.6 8-9.5V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  retry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>`,
  replay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M10 9v6l5-3-5-3Z"/></svg>`,
  dryrun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/><path d="M3 19h18"/></svg>`,
  review: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/><path d="M11 8v3l2 2"/></svg>`,
  failfast: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 16H3l9-16Z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>`,
  placeholder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="3"/><path d="M8 10h5"/><path d="M8 14h8"/></svg>`,
  vault: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M12 11v3"/></svg>`,
  killswitch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4v8"/><path d="m5 12 14 0"/></svg>`,
  contract: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6V3Z"/><path d="M14 3v5h5"/><path d="M9 12h7"/><path d="M9 16h7"/></svg>`,
  posture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>`,
  replaysafe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 17-4"/><path d="M20 4v4h-4"/><path d="M21 12a9 9 0 0 1-17 4"/><path d="M4 20v-4h4"/></svg>`
};

function featureCard(title: string, detail: string, accent: string, iconKey: string): string {
  const icon = FEATURE_ICONS[iconKey] ?? FEATURE_ICONS.contract;
  return `
    <article class="panel feature-card">
      <div class="feature-mark ${accent}">${icon}</div>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(detail)}</p>
      </div>
    </article>
  `;
}

function metricCard(label: string, value: string, detail: string): string {
  return `
    <article class="panel metric">
      <div class="metric-head">
        <span class="dot"></span>
        <span class="label">${escapeHtml(label)}</span>
      </div>
      <div class="value mono">${escapeHtml(value)}</div>
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
          <div>${pillStatus(check.status)}</div>
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
            <h3>${escapeHtml(scenario.connectorName)} · <span class="accent-op">${escapeHtml(scenario.operationName)}</span></h3>
            <div class="endpoint-row">
              <span class="endpoint-tag">endpoint</span>
              <code class="endpoint-code">${escapeHtml(scenario.endpoint)}</code>
            </div>
            <div class="meta">${escapeHtml(scenario.expectedOutcome)}</div>
            <div class="signal-row">
              <span class="signal">${escapeHtml(scenario.authModel)}</span>
              <span class="signal">${escapeHtml(scenario.requiredInputs.join(", "))}</span>
            </div>
          </div>
          <div>${pillStatus(scenario.executionMode)}</div>
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
          <td>${pillStatus(secretCase.status)}</td>
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
            <div class="meta"><strong class="row-label">Trigger</strong> ${escapeHtml(failure.trigger)}</div>
            <div class="meta"><strong class="row-label">Observed</strong> ${escapeHtml(failure.observedFailure)}</div>
            <div class="signal-row">
              <span class="signal">${escapeHtml(failure.retryPolicy)}</span>
              <span class="signal">${escapeHtml(failure.operatorAction)}</span>
            </div>
          </div>
          <div>${pillStatus(failure.status)}</div>
        </div>
      `
    )
    .join("");
}

const META_DESCRIPTION =
  "Contract-test outbound Camunda connectors before BPMN variables, secret posture, and retry logic drift. Server-rendered TypeScript harness with scenario matrix, secret replacement, failure lab, and verification posture in one operator-readable surface.";

export function page(active: string, body: string): string {
  const pageTitle = active === "overview"
    ? "Camunda Connector Test Harness"
    : `${active.replace(/\b\w/g, (c) => c.toUpperCase())} · Camunda Connector Test Harness`;
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(META_DESCRIPTION)}" />
    <meta name="theme-color" content="#06080F" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Kinetic Gain" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(META_DESCRIPTION)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(META_DESCRIPTION)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #06080F;
        --bg-2: #050710;
        --panel: #0e1424;
        --panel-2: #0a1020;
        --panel-3: #060A14;
        --line: rgba(148,163,184,.10);
        --line-strong: rgba(148,163,184,.18);
        --text: #F4F7FB;
        --muted: #B6C4DE;
        --muted-2: #8FA2C0;
        --camunda-blue: #2D7BFF;
        --camunda-blue-glow: rgba(45,123,255,.40);
        --camunda-blue-soft: rgba(45,123,255,.12);
        --camunda-teal: #1ED3C6;
        --camunda-amber: #F3B33D;
        --camunda-rose: #FB7185;
        --camunda-emerald: #4ADE80;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: "Inter", "Segoe UI", system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(1100px 600px at 18% -8%, rgba(45,123,255,0.18), transparent 55%),
          radial-gradient(900px 520px at 95% 8%, rgba(30,211,198,0.12), transparent 55%),
          radial-gradient(700px 420px at 50% 100%, rgba(45,123,255,0.10), transparent 60%),
          linear-gradient(180deg, var(--bg-2) 0%, var(--bg) 45%, var(--bg-2) 100%);
        min-height: 100vh;
        -webkit-font-smoothing: antialiased;
      }
      a { color: inherit; text-decoration: none; }
      svg { display: block; }
      .mono { font-family: "JetBrains Mono", "Cascadia Code", Consolas, monospace; font-feature-settings: "ss01" on, "ss02" on; }
      .shell { max-width: 1460px; margin: 0 auto; padding: 28px; position: relative; }
      .shell::before {
        content: "";
        position: fixed; inset: 0; pointer-events: none; z-index: -1;
        background-image:
          linear-gradient(to right, rgba(148,163,184,.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148,163,184,.04) 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: radial-gradient(ellipse at center, rgba(0,0,0,1), rgba(0,0,0,0) 75%);
      }

      .topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 20px;
        padding: 18px 22px; border-radius: 24px; border: 1px solid var(--line-strong);
        background: linear-gradient(180deg, rgba(14,20,36,.92), rgba(10,16,32,.92));
        box-shadow: 0 28px 60px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.04);
        position: sticky; top: 12px; z-index: 5;
        backdrop-filter: blur(12px);
      }
      .brand { display: flex; align-items: center; gap: 14px; }
      .mark {
        width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center;
        background: linear-gradient(135deg, var(--camunda-blue) 0%, #5B9DFF 100%);
        color: white; font-weight: 900; letter-spacing: .04em; font-size: 14px;
        box-shadow: 0 0 22px var(--camunda-blue-glow), inset 0 1px 0 rgba(255,255,255,.18);
      }
      .brand-text strong { display: block; font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
      .brand-text span {
        display: block; margin-top: 3px; color: var(--muted-2);
        font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
        font-family: "JetBrains Mono", monospace;
      }
      .nav { display: flex; flex-wrap: wrap; gap: 6px; }
      .nav-link {
        padding: 9px 14px; border-radius: 999px; border: 1px solid transparent;
        background: transparent; color: var(--muted);
        font-family: "JetBrains Mono", monospace;
        font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
        transition: background .15s ease, color .15s ease, border-color .15s ease;
      }
      .nav-link:hover { color: var(--text); background: rgba(255,255,255,.04); border-color: var(--line); }
      .nav-link.active {
        background: linear-gradient(135deg, var(--camunda-blue) 0%, #5B9DFF 100%);
        color: white; border-color: rgba(255,255,255,.16);
        box-shadow: 0 0 18px var(--camunda-blue-glow);
      }

      .hero {
        margin-top: 22px;
        padding: 36px;
        border-radius: 28px;
        border: 1px solid var(--line-strong);
        background:
          radial-gradient(800px 420px at 0% 0%, rgba(45,123,255,.10), transparent 55%),
          radial-gradient(600px 320px at 100% 100%, rgba(30,211,198,.08), transparent 55%),
          linear-gradient(180deg, rgba(14,20,36,.94), rgba(10,16,32,.94));
        box-shadow: 0 30px 70px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.04);
        position: relative;
        overflow: hidden;
      }
      .hero::before {
        content: "";
        position: absolute; top: -160px; right: -160px;
        width: 380px; height: 380px;
        background: radial-gradient(circle, rgba(45,123,255,.22), transparent 70%);
        filter: blur(20px);
        pointer-events: none;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.25fr 1fr;
        gap: 28px;
        align-items: stretch;
        position: relative;
        z-index: 1;
      }
      .eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        color: #8FC9FF;
        font-family: "JetBrains Mono", monospace;
        font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
        padding: 5px 10px; border-radius: 999px;
        border: 1px solid rgba(45,123,255,.22);
        background: rgba(45,123,255,.08);
      }
      .eyebrow::before {
        content: ""; width: 6px; height: 6px; border-radius: 50%;
        background: var(--camunda-blue);
        box-shadow: 0 0 8px var(--camunda-blue);
      }
      h1 {
        margin: 18px 0 16px;
        font-family: "Instrument Serif", Georgia, "Times New Roman", serif;
        font-weight: 400;
        font-size: clamp(46px, 5.8vw, 78px);
        line-height: 0.96;
        letter-spacing: -0.022em;
        color: var(--text);
      }
      h1 .accent-word { font-style: italic; color: #8FC9FF; }
      h2 {
        margin: 10px 0 12px;
        font-family: "Instrument Serif", Georgia, "Times New Roman", serif;
        font-weight: 400;
        font-size: 30px;
        line-height: 1.1;
        letter-spacing: -0.018em;
      }
      h3 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -.01em; }
      p, .meta, td, th, div, span, strong { overflow-wrap: anywhere; }
      p, .meta { color: var(--muted); line-height: 1.62; font-size: 14.5px; }
      .row-label {
        display: inline-block;
        font-family: "JetBrains Mono", monospace;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: var(--muted-2);
        margin-right: 6px;
      }
      .accent-op { color: #8FC9FF; font-family: "JetBrains Mono", monospace; font-size: 14px; font-weight: 600; }
      .endpoint-row {
        display: flex; align-items: center; gap: 8px;
        margin-top: 10px;
      }
      .endpoint-tag {
        font-family: "JetBrains Mono", monospace;
        font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
        color: var(--muted-2);
      }
      .endpoint-code {
        font-family: "JetBrains Mono", monospace;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
        background: var(--panel-3);
        border: 1px solid var(--line);
        color: #BFD6FF;
      }
      .callout {
        margin-top: 22px; padding: 18px 20px; border-radius: 16px;
        background: linear-gradient(180deg, rgba(243,179,61,.10), rgba(243,179,61,.04));
        border: 1px solid rgba(243,179,61,.22);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      }
      .callout strong {
        display: flex; align-items: center; gap: 6px;
        color: var(--camunda-amber); margin-bottom: 8px;
        font-family: "JetBrains Mono", monospace;
        font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
      }
      .callout strong::before {
        content: ""; width: 6px; height: 6px; border-radius: 50%;
        background: var(--camunda-amber); box-shadow: 0 0 8px var(--camunda-amber);
      }
      .callout span { color: #FFEEC2; font-size: 15px; line-height: 1.55; }

      .hero-visual {
        padding: 22px;
        border-radius: 22px;
        border: 1px solid var(--line-strong);
        background:
          radial-gradient(circle at top right, rgba(45,123,255,.14), transparent 50%),
          linear-gradient(180deg, rgba(14,20,36,.96), rgba(6,10,20,.96));
        display: flex; flex-direction: column; gap: 18px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      }
      .trace-rail {
        position: relative;
        min-height: 240px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background:
          linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.005)),
          radial-gradient(circle at center, rgba(30,211,198,0.08), transparent 50%);
        overflow: hidden;
      }
      .trace-rail::before {
        content: "";
        position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, rgba(148,163,184,.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148,163,184,.04) 1px, transparent 1px);
        background-size: 28px 28px;
        opacity: .6;
      }
      .trace-node {
        position: absolute;
        width: 124px;
        padding: 12px 12px;
        border-radius: 14px;
        border: 1px solid var(--line-strong);
        background: linear-gradient(180deg, rgba(14,20,36,.98), rgba(10,16,32,.98));
        text-align: center;
        box-shadow: 0 8px 28px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.04);
      }
      .trace-node strong {
        display: block; font-size: 11.5px; font-weight: 800; letter-spacing: .04em; color: var(--text);
      }
      .trace-node span {
        display: block; margin-top: 4px; color: var(--muted-2);
        font-family: "JetBrains Mono", monospace;
        font-size: 10px; letter-spacing: .04em;
      }
      .trace-node.source { top: 22px; left: 22px; border-color: rgba(45,123,255,.32); box-shadow: 0 8px 28px rgba(0,0,0,.36), 0 0 22px rgba(45,123,255,.18); }
      .trace-node.engine { top: 96px; left: calc(50% - 62px); border-color: rgba(30,211,198,.32); box-shadow: 0 8px 28px rgba(0,0,0,.36), 0 0 22px rgba(30,211,198,.18); }
      .trace-node.target { top: 22px; right: 22px; border-color: rgba(45,123,255,.32); box-shadow: 0 8px 28px rgba(0,0,0,.36), 0 0 22px rgba(45,123,255,.18); }
      .trace-node.audit { bottom: 22px; left: calc(50% - 62px); border-color: rgba(243,179,61,.32); box-shadow: 0 8px 28px rgba(0,0,0,.36), 0 0 22px rgba(243,179,61,.16); }
      .trace-line {
        position: absolute;
        background: linear-gradient(90deg, rgba(45,123,255,.18), rgba(30,211,198,.55), rgba(45,123,255,.18));
        box-shadow: 0 0 14px rgba(45,123,255,.35);
      }
      .trace-line.h-left { top: 76px; left: 146px; width: calc(50% - 178px); height: 2px; }
      .trace-line.h-right { top: 76px; right: 146px; width: calc(50% - 178px); height: 2px; }
      .trace-line.v-mid { top: 140px; left: calc(50% - 1px); width: 2px; height: 50px; background: linear-gradient(180deg, rgba(30,211,198,.55), rgba(243,179,61,.55)); }
      .hero-kpis {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .hero-kpi {
        padding: 14px 14px;
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,.005));
        border: 1px solid var(--line);
      }
      .hero-kpi span {
        display: flex; align-items: center; gap: 6px;
        color: var(--muted-2);
        font-family: "JetBrains Mono", monospace;
        font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
      }
      .hero-kpi span::before {
        content: ""; width: 5px; height: 5px; border-radius: 50%;
        background: var(--camunda-blue); box-shadow: 0 0 6px var(--camunda-blue);
      }
      .hero-kpi strong {
        display: block; margin-top: 8px; font-size: 30px;
        font-family: "JetBrains Mono", monospace;
        font-weight: 700; letter-spacing: -.03em; color: var(--text);
      }

      .grid { display: grid; gap: 16px; margin-top: 20px; }
      .grid-four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .grid-three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .grid-two { grid-template-columns: 1fr 1fr; }

      .panel {
        border: 1px solid var(--line-strong);
        background: linear-gradient(180deg, rgba(14,20,36,.92), rgba(10,16,32,.92));
        border-radius: 22px;
        box-shadow: 0 22px 50px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.03);
      }
      .section { padding: 24px 26px; }

      .feature-card {
        padding: 22px;
        display: grid;
        grid-template-columns: 56px 1fr;
        gap: 16px;
        align-items: start;
        position: relative;
        overflow: hidden;
      }
      .feature-card::before {
        content: "";
        position: absolute; top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--camunda-blue), transparent);
        opacity: .5;
      }
      .feature-mark {
        width: 56px; height: 56px; border-radius: 14px;
        display: grid; place-items: center;
        background: rgba(255,255,255,.02);
        border: 1px solid var(--line);
      }
      .feature-mark svg { width: 24px; height: 24px; }
      .feature-mark.blue { color: #8FC9FF; background: linear-gradient(135deg, rgba(45,123,255,.22), rgba(45,123,255,.06)); border-color: rgba(45,123,255,.28); box-shadow: 0 0 18px rgba(45,123,255,.14); }
      .feature-mark.teal { color: #79EEDF; background: linear-gradient(135deg, rgba(30,211,198,.22), rgba(30,211,198,.06)); border-color: rgba(30,211,198,.28); box-shadow: 0 0 18px rgba(30,211,198,.14); }
      .feature-mark.rose { color: #FCA5B0; background: linear-gradient(135deg, rgba(251,113,133,.22), rgba(251,113,133,.06)); border-color: rgba(251,113,133,.28); box-shadow: 0 0 18px rgba(251,113,133,.14); }
      .feature-mark.amber { color: #FFD89B; background: linear-gradient(135deg, rgba(243,179,61,.22), rgba(243,179,61,.06)); border-color: rgba(243,179,61,.28); box-shadow: 0 0 18px rgba(243,179,61,.14); }
      .feature-card h3 { font-size: 19px; }
      .feature-card p { margin-top: 8px; }

      .metric {
        padding: 22px 24px;
        position: relative;
      }
      .metric-head {
        display: flex; align-items: center; gap: 8px;
      }
      .metric-head .dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--camunda-blue);
        box-shadow: 0 0 10px var(--camunda-blue);
      }
      .metric .label {
        font-family: "JetBrains Mono", monospace;
        color: var(--muted-2);
        font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
      }
      .metric .value {
        margin-top: 14px;
        font-size: 52px;
        font-weight: 700;
        letter-spacing: -.04em;
        line-height: 1;
        color: var(--text);
      }
      .metric p { margin-top: 12px; font-size: 13.5px; color: var(--muted); }

      .signal-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .signal {
        display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px;
        background: rgba(45,123,255,.12); color: #BED5FF;
        font-family: "JetBrains Mono", monospace;
        font-size: 10.5px; font-weight: 600; letter-spacing: .04em;
        border: 1px solid rgba(45,123,255,.22);
      }

      .status {
        display: inline-flex; align-items: center; gap: 6px; min-width: 110px;
        padding: 6px 12px 6px 8px;
        border-radius: 999px;
        font-family: "JetBrains Mono", monospace;
        font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
        white-space: nowrap;
      }
      .status-ic { width: 14px; height: 14px; display: grid; place-items: center; }
      .status-ic svg { width: 14px; height: 14px; }
      .status.ready { color: #B5F5C8; background: rgba(74,222,128,.10); border: 1px solid rgba(74,222,128,.25); }
      .status.review { color: #FFE29B; background: rgba(243,179,61,.10); border: 1px solid rgba(243,179,61,.25); }
      .status.watch { color: #A8F0E9; background: rgba(30,211,198,.10); border: 1px solid rgba(30,211,198,.25); }
      .status.critical { color: #FFC2CC; background: rgba(251,113,133,.10); border: 1px solid rgba(251,113,133,.30); }

      .list-row {
        padding: 18px 0; border-top: 1px solid var(--line);
        display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: start;
      }
      .list-row:first-of-type { border-top: none; padding-top: 8px; }
      .list-row h3 { font-size: 15.5px; font-weight: 700; }
      .list-row .meta { font-size: 13.5px; margin-top: 6px; }

      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 14px 18px; text-align: left; vertical-align: top; }
      thead th {
        font-family: "JetBrains Mono", monospace;
        color: var(--muted-2); font-size: 10px; text-transform: uppercase;
        letter-spacing: .16em; border-bottom: 1px solid var(--line);
        font-weight: 700;
      }
      tbody td { font-size: 14px; color: var(--text); }
      tbody td .meta { color: var(--muted-2); margin-top: 4px; }
      tbody tr + tr td { border-top: 1px solid var(--line); }

      .footer {
        margin-top: 22px;
        padding: 18px 22px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(14,20,36,.6), rgba(10,16,32,.6));
        color: var(--muted-2);
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
        display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
      }
      .footer span { letter-spacing: .04em; }

      @media (max-width: 1180px) {
        .grid-four, .grid-three, .grid-two, .hero-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 860px) {
        .grid-four, .grid-three, .grid-two, .hero-grid { grid-template-columns: 1fr; }
        .topbar { flex-direction: column; align-items: stretch; }
        .hero-kpis { grid-template-columns: 1fr; }
        .list-row { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="topbar">
        <div class="brand">
          <div class="mark">CM</div>
          <div class="brand-text">
            <strong>Camunda Connector Test Harness</strong>
            <span>Connector contract validation + failure simulation</span>
          </div>
        </div>
        <div class="nav">${nav(active)}</div>
      </section>
      ${body}
      <div class="footer">
        <span>Contract-test outbound connectors before BPMN variables, secrets, and retries drift into fragile automation.</span>
        <span>Part of the Kinetic Gain operator-surface portfolio.</span>
      </div>
    </main>
  </body>
  </html>`;
}

export function overview(service: HarnessService): string {
  const summary = service.summary();
  return `
    <section class="hero">
      <div class="hero-grid">
        <div>
          <span class="eyebrow">Camunda connector harness</span>
          <h1>Exercise outbound connectors before secret posture, retries, and variable mappings go <span class="accent-word">sideways.</span></h1>
          <p>Use this repo to model scenario validation, required-input checks, secret replacement, and failure behavior for Camunda-style outbound connectors.</p>
          <div class="callout">
            <strong>Lead recommendation</strong>
            <span>${escapeHtml(summary.leadRecommendation)}</span>
          </div>
        </div>
        <aside class="hero-visual">
          <div>
            <span class="eyebrow">Execution trace</span>
            <h2>Validate the connector lane before the worker ever mutates a downstream system.</h2>
          </div>
          <div class="trace-rail" aria-label="Execution trace diagram">
            <div class="trace-line h-left"></div>
            <div class="trace-line h-right"></div>
            <div class="trace-line v-mid"></div>
            <div class="trace-node source"><strong>Inputs</strong><span>BPMN vars</span></div>
            <div class="trace-node engine"><strong>Harness</strong><span>validate + mask</span></div>
            <div class="trace-node target"><strong>Connector</strong><span>dispatch gate</span></div>
            <div class="trace-node audit"><strong>Replay</strong><span>retry + explain</span></div>
          </div>
          <div class="hero-kpis">
            <div class="hero-kpi"><span>Ready</span><strong>${summary.readyScenarios}</strong></div>
            <div class="hero-kpi"><span>Secret checks</span><strong>${summary.secretReplacementChecks}</strong></div>
            <div class="hero-kpi"><span>Failure sims</span><strong>${summary.failureSimulations}</strong></div>
          </div>
        </aside>
      </div>
    </section>
    <section class="grid grid-three">
      ${featureCard("Secret Masking", "Replace connector secrets through explicit placeholders instead of unsafe fallback values.", "teal", "shield")}
      ${featureCard("Retry Discipline", "Keep transport retries separate from validation failures and privileged-review paths.", "blue", "retry")}
      ${featureCard("Failure Replay", "Show why a connector retried, halted, or escalated with one readable control surface.", "rose", "replay")}
    </section>
    <section class="grid grid-four">
      ${metricCard("Scenario count", String(summary.scenarioCount), "Modeled connector test scenarios in the harness.")}
      ${metricCard("Ready scenarios", String(summary.readyScenarios), "Safe dry-run lanes ready for dispatch validation.")}
      ${metricCard("Secret checks", String(summary.secretReplacementChecks), "Credential replacement cases under review.")}
      ${metricCard("Failure simulations", String(summary.failureSimulations), "Retry, fail-fast, and replay cases in the lab.")}
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <span class="eyebrow">Scenario lanes</span>
        <h2>The harness treats outbound connector tests like operator workflows, not toy mocks.</h2>
        <p>Each scenario pairs the endpoint, auth posture, required inputs, execution mode, and expected outcome so connector behavior stays explainable.</p>
        ${signalList(service.scenarios().map((scenario) => `${scenario.operationName} · ${scenario.executionMode}`))}
      </article>
      <article class="panel section">
        <span class="eyebrow">Verification posture</span>
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
      <span class="eyebrow">Scenario matrix</span>
      <h1>See exactly what each connector scenario validates before the worker sends anything <span class="accent-word">downstream.</span></h1>
      <p>The matrix keeps required inputs, auth posture, execution mode, and expected connector outcomes visible for each modeled test lane.</p>
    </section>
    <section class="grid grid-three">
      ${featureCard("Dry-run Ready", "Safe connector cases that should pass schema and dispatch checks without privileged review.", "blue", "dryrun")}
      ${featureCard("Manual Review", "Connector cases that should stop at the approval lane before secrets or access changes go live.", "teal", "review")}
      ${featureCard("Fail-fast", "Malformed inputs and unsafe auth posture should stop immediately, not burn retries.", "rose", "failfast")}
    </section>
    <section class="grid">
      <article class="panel section">
        <span class="eyebrow">Connector scenarios</span>
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
      <span class="eyebrow">Secret replacement</span>
      <h1>Credential handling should fail clearly, not quietly fall back to <span class="accent-word">unsafe defaults.</span></h1>
      <p>This route tracks whether each connector scenario resolves its secret placeholders through a real source or drifts toward static fallback behavior.</p>
    </section>
    <section class="grid grid-three">
      ${featureCard("Placeholder-only refs", "Keep connector config tied to replacement keys instead of embedding credentials in worker input.", "blue", "placeholder")}
      ${featureCard("Vault-aware review", "Make cert rotation and secret-source posture visible before a scenario is marked safe.", "teal", "vault")}
      ${featureCard("Critical fallback kill-switch", "Hard-coded fallback tokens should surface as red-lane harness failures.", "rose", "killswitch")}
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <span class="eyebrow">Replacement inventory</span>
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
        <span class="eyebrow">Policy lane</span>
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
      <span class="eyebrow">Failure lab</span>
      <h1>Simulate connector retries, validation stops, and replay-safe operator actions before they hit <span class="accent-word">production workflows.</span></h1>
      <p>The failure lab keeps trigger, observed behavior, retry policy, and operator action tied together so teams can explain what the connector should do under stress.</p>
    </section>
    <section class="grid grid-three">
      ${featureCard("Retry queued", "Transient downstream issues with a retry policy still belong in a controlled lane.", "teal", "retry")}
      ${featureCard("Manual escalation", "Some failures need an operator to look at the message before the next attempt.", "amber", "review")}
      ${featureCard("Fail-fast halt", "Auth, schema, and validation problems should stop instantly with no retry burn.", "rose", "failfast")}
    </section>
    <section class="grid">
      <article class="panel section">
        <span class="eyebrow">Simulation matrix</span>
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
      <span class="eyebrow">Verification</span>
      <h1>What the harness proves about connector safety, secret discipline, and failure replay <span class="accent-word">right now.</span></h1>
      <p>The current snapshot shows whether the connector lane is validating required inputs, handling secrets safely, and separating retryable problems from fail-fast conditions.</p>
    </section>
    <section class="grid grid-three">
      ${featureCard("Contract quality", "Prove that required variables and payload shape are validated before connector dispatch.", "blue", "contract")}
      ${featureCard("Secret posture", "Keep replacement source clarity and fallback behavior visible in the same review lane.", "teal", "posture")}
      ${featureCard("Replay safety", "Explain why a scenario retried, halted, or escalated after a failure simulation.", "rose", "replaysafe")}
    </section>
    <section class="grid grid-four">
      ${metricCard("Mapped scenarios", String(service.scenarios().length), "Connector lanes already modeled in the harness.")}
      ${metricCard("Ready checks", String(readyChecks), "Verification lanes already in the green posture.")}
      ${metricCard("Review checks", String(reviewChecks), "Controls that still deserve manual scrutiny.")}
      ${metricCard("Critical secret cases", String(service.secretReplacementCases().filter((item) => item.status === "critical").length), "Credential paths that should fail the build or review gate.")}
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <span class="eyebrow">Snapshot posture</span>
        <h2>The harness is strongest when validation, secrets, and retries remain visible together.</h2>
        <p>That makes the repo useful to workflow engineers, platform teams, and reviewers who need to understand connector behavior before rollout.</p>
        ${signalList([
          `${readyChecks} ready`,
          `${reviewChecks} review`,
          `${service.failureSimulations().length} failure simulations`
        ])}
      </article>
      <article class="panel section">
        <span class="eyebrow">Control checks</span>
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
      <span class="eyebrow">Docs</span>
      <h1>Route and payload map for the Camunda connector <span class="accent-word">test harness.</span></h1>
      <p>The HTML routes explain the harness visually. The JSON routes expose the same scenario, secret, failure, and verification payloads for tests and automation.</p>
    </section>
    <section class="grid grid-two">
      <article class="panel section">
        <span class="eyebrow">HTML surfaces</span>
        <h2>The repo keeps connector testing legible from several angles.</h2>
        <div class="list-row"><div><h3>Overview</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/</code></div></div></div>
        <div class="list-row"><div><h3>Scenario matrix</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/scenario-matrix</code></div></div></div>
        <div class="list-row"><div><h3>Secret replacement</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/secret-replacement</code></div></div></div>
        <div class="list-row"><div><h3>Failure lab</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/failure-lab</code></div></div></div>
        <div class="list-row"><div><h3>Verification</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/verification</code></div></div></div>
      </article>
      <article class="panel section">
        <span class="eyebrow">JSON APIs</span>
        <h2>The same harness state is available as machine-readable payloads.</h2>
        <div class="list-row"><div><h3>Summary</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/api/dashboard/summary</code></div></div></div>
        <div class="list-row"><div><h3>Scenarios</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/api/scenarios</code></div></div></div>
        <div class="list-row"><div><h3>Secret cases</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/api/secret-replacement</code></div></div></div>
        <div class="list-row"><div><h3>Failure simulations</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/api/failure-simulations</code></div></div></div>
        <div class="list-row"><div><h3>Verification + snapshot</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/api/verification-checks</code></div></div></div>
        <div class="list-row"><div><h3>Sample + health</h3><div class="endpoint-row"><span class="endpoint-tag">GET</span><code class="endpoint-code">/api/sample · /api/health</code></div></div></div>
      </article>
    </section>
  `;
}
