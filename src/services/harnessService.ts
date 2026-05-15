import {
  connectorScenarios,
  failureSimulations,
  secretCases,
  verificationChecks
} from "../data/sampleData.js";
import type {
  DashboardSummary,
  Snapshot
} from "../types.js";

export class HarnessService {
  summary(): DashboardSummary {
    return {
      scenarioCount: connectorScenarios.length,
      readyScenarios: connectorScenarios.filter((scenario) => scenario.executionMode === "dry-run ready").length,
      secretReplacementChecks: secretCases.length,
      failureSimulations: failureSimulations.length,
      leadRecommendation:
        "Treat secret replacement and fail-fast validation as first-class connector checks before retry logic ever gets a chance to run."
    };
  }

  scenarios() {
    return connectorScenarios;
  }

  secretReplacementCases() {
    return secretCases;
  }

  failureSimulations() {
    return failureSimulations;
  }

  verificationChecks() {
    return verificationChecks;
  }

  snapshot(): Snapshot {
    return {
      summary: this.summary(),
      scenarios: this.scenarios(),
      secretCases: this.secretReplacementCases(),
      failureSimulations: this.failureSimulations(),
      verificationChecks: this.verificationChecks()
    };
  }
}
