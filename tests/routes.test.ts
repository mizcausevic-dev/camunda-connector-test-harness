import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("route surfaces", () => {
  it("renders the overview route", async () => {
    const response = await request(createApp()).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Exercise outbound connectors before secret posture, retries, and variable mappings go sideways.");
  });

  it("returns the summary payload", async () => {
    const response = await request(createApp()).get("/api/dashboard/summary");

    expect(response.status).toBe(200);
    expect(response.body.scenarioCount).toBe(4);
  });
});
