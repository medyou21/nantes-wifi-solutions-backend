import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("API", () => {
  it("returns a controlled 404 response", async () => {
    const response = await request(app).get("/route-inconnue");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route introuvable");
  });
});
