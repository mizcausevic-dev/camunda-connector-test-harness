import type {
  ConnectorScenario,
  FailureSimulation,
  SecretReplacementCase,
  VerificationCheck
} from "../types.js";

export const connectorScenarios: ConnectorScenario[] = [
  {
    connectorName: "Salesforce Case Escalation Connector",
    operationName: "raiseEscalation",
    endpoint: "POST /connectors/salesforce/escalations",
    authModel: "OAuth 2.0 client credentials",
    requiredInputs: ["caseId", "priority", "ownerQueue"],
    executionMode: "dry-run ready",
    expectedOutcome: "Creates escalation payload with validated connector variables.",
    rationale: "Baseline outbound connector path for structured case escalation."
  },
  {
    connectorName: "ServiceNow Access Broker Connector",
    operationName: "submitAccessRequest",
    endpoint: "POST /connectors/servicenow/access-request",
    authModel: "API key + secret replacement",
    requiredInputs: ["userId", "requestedRole", "requestReason"],
    executionMode: "manual review",
    expectedOutcome: "Routes privileged request through reviewer gate before dispatch.",
    rationale: "Privileged access changes should not auto-run from a blind connector test."
  },
  {
    connectorName: "Workday Worker Sync Connector",
    operationName: "syncWorkerProfile",
    endpoint: "PATCH /connectors/workday/workers/{workerId}",
    authModel: "mTLS + client secret",
    requiredInputs: ["workerId", "managerId", "costCenter"],
    executionMode: "retry queued",
    expectedOutcome: "Retries transient downstream fault with bounded backoff and audit trace.",
    rationale: "Worker updates often depend on upstream systems that recover after short outages."
  },
  {
    connectorName: "Coupa Vendor Hold Connector",
    operationName: "placeVendorOnHold",
    endpoint: "PATCH /connectors/coupa/vendors/{vendorId}",
    authModel: "Bearer token",
    requiredInputs: ["vendorId", "holdReason"],
    executionMode: "fail-fast",
    expectedOutcome: "Stops immediately when required inputs or auth posture are invalid.",
    rationale: "Procurement-state mutations should not retry blindly on malformed inputs."
  }
];

export const secretCases: SecretReplacementCase[] = [
  {
    key: "CAMUNDA_CONNECTOR_SNOW_API_KEY",
    sourcePattern: "{{secrets.SNOW_API_KEY}}",
    replacementSource: "runtime worker secrets map",
    status: "ready",
    recommendation: "Keep placeholder-only references in connector config and inject at execution time."
  },
  {
    key: "CAMUNDA_CONNECTOR_WORKDAY_CERT",
    sourcePattern: "{{secrets.WORKDAY_CERT}}",
    replacementSource: "vault-backed certificate reference",
    status: "review",
    recommendation: "Confirm cert rotation and expiry monitoring are part of the harness run."
  },
  {
    key: "CAMUNDA_CONNECTOR_COUPA_TOKEN",
    sourcePattern: "hard-coded fallback token",
    replacementSource: "none",
    status: "critical",
    recommendation: "Remove hard-coded fallback and force secret resolution failure instead."
  }
];

export const failureSimulations: FailureSimulation[] = [
  {
    scenarioName: "Workday downstream timeout",
    trigger: "Injected 504 from worker sync endpoint",
    observedFailure: "Connector returns timeout after request body validation succeeds.",
    retryPolicy: "3 retries with 30s / 60s / 120s backoff",
    operatorAction: "Keep event in retry lane until target recovers or SLA window expires.",
    status: "watch"
  },
  {
    scenarioName: "Missing ServiceNow request reason",
    trigger: "Required variable omitted from connector input map",
    observedFailure: "Harness fails validation before network dispatch.",
    retryPolicy: "No retry on validation failure",
    operatorAction: "Force manual fix in test data or BPMN variable mapping.",
    status: "critical"
  },
  {
    scenarioName: "Salesforce rate-limit burst",
    trigger: "Injected 429 after repeated escalation calls",
    observedFailure: "Connector should surface retry-after handling instead of duplicate payload send.",
    retryPolicy: "Honor retry-after header + bounded replay",
    operatorAction: "Review idempotency key handling in the connector worker.",
    status: "review"
  }
];

export const verificationChecks: VerificationCheck[] = [
  {
    category: "Required input validation",
    question: "Does the harness reject missing connector variables before any outbound call is attempted?",
    recommendation: "Keep variable schema checks at the front of every scenario run.",
    status: "ready"
  },
  {
    category: "Secret replacement posture",
    question: "Are all credential fields resolved through placeholders instead of static fallbacks?",
    recommendation: "Force placeholder resolution failures to surface in tests instead of silently substituting defaults.",
    status: "review"
  },
  {
    category: "Retry discipline",
    question: "Do transient failures retry differently from malformed requests and auth posture failures?",
    recommendation: "Separate retryable transport errors from fail-fast validation paths in the simulation matrix.",
    status: "ready"
  },
  {
    category: "Failure replay clarity",
    question: "Can operators explain why a scenario retried, halted, or escalated?",
    recommendation: "Keep trigger, observed failure, retry policy, and operator action visible in one lane.",
    status: "review"
  }
];
