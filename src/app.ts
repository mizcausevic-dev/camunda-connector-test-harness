import express from "express";
import { HarnessService } from "./services/harnessService.js";
import {
  docs,
  failureLab,
  overview,
  page,
  scenarioMatrix,
  secretReplacement,
  verification
} from "./services/render.js";

export function createApp() {
  const app = express();
  const service = new HarnessService();

  app.get("/", (_req, res) => res.type("html").send(page("overview", overview(service))));
  app.get("/scenario-matrix", (_req, res) =>
    res.type("html").send(page("scenario matrix", scenarioMatrix(service))));
  app.get("/secret-replacement", (_req, res) =>
    res.type("html").send(page("secret replacement", secretReplacement(service))));
  app.get("/failure-lab", (_req, res) => res.type("html").send(page("failure lab", failureLab(service))));
  app.get("/verification", (_req, res) => res.type("html").send(page("verification", verification(service))));
  app.get("/docs", (_req, res) => res.type("html").send(page("docs", docs())));

  app.get("/api/dashboard/summary", (_req, res) => res.json(service.summary()));
  app.get("/api/scenarios", (_req, res) => res.json(service.scenarios()));
  app.get("/api/secret-replacement", (_req, res) => res.json(service.secretReplacementCases()));
  app.get("/api/failure-simulations", (_req, res) => res.json(service.failureSimulations()));
  app.get("/api/verification-checks", (_req, res) => res.json(service.verificationChecks()));
  app.get("/api/sample", (_req, res) => res.json(service.snapshot()));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "camunda-connector-test-harness" }));

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? "5124");
  createApp().listen(port, "127.0.0.1", () => {
    console.log(`camunda-connector-test-harness listening on http://127.0.0.1:${port}`);
  });
}
