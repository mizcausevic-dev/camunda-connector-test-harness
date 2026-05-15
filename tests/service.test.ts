import { describe, expect, it } from "vitest";
import { HarnessService } from "../src/services/harnessService.js";

describe("HarnessService", () => {
  it("returns expected summary counts", () => {
    const service = new HarnessService();
    const summary = service.summary();

    expect(summary.scenarioCount).toBe(4);
    expect(summary.readyScenarios).toBe(1);
    expect(summary.secretReplacementChecks).toBe(3);
    expect(summary.failureSimulations).toBe(3);
  });

  it("includes a manual review scenario and a critical secret case", () => {
    const service = new HarnessService();
    const snapshot = service.snapshot();

    expect(snapshot.scenarios.some((scenario) => scenario.executionMode === "manual review")).toBe(true);
    expect(snapshot.secretCases.some((secretCase) => secretCase.status === "critical")).toBe(true);
  });
});
