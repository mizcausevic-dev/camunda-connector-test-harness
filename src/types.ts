export type ScenarioStatus = "ready" | "review" | "critical" | "watch";
export type ExecutionMode = "dry-run ready" | "manual review" | "retry queued" | "fail-fast";

export interface DashboardSummary {
  scenarioCount: number;
  readyScenarios: number;
  secretReplacementChecks: number;
  failureSimulations: number;
  leadRecommendation: string;
}

export interface ConnectorScenario {
  connectorName: string;
  operationName: string;
  endpoint: string;
  authModel: string;
  requiredInputs: string[];
  executionMode: ExecutionMode;
  expectedOutcome: string;
  rationale: string;
}

export interface SecretReplacementCase {
  key: string;
  sourcePattern: string;
  replacementSource: string;
  status: ScenarioStatus;
  recommendation: string;
}

export interface FailureSimulation {
  scenarioName: string;
  trigger: string;
  observedFailure: string;
  retryPolicy: string;
  operatorAction: string;
  status: ScenarioStatus;
}

export interface VerificationCheck {
  category: string;
  question: string;
  recommendation: string;
  status: ScenarioStatus;
}

export interface Snapshot {
  summary: DashboardSummary;
  scenarios: ConnectorScenario[];
  secretCases: SecretReplacementCase[];
  failureSimulations: FailureSimulation[];
  verificationChecks: VerificationCheck[];
}
