import { vi, beforeAll } from "vitest";
import { mkdirp } from "mkdirp";
import { rimraf } from "rimraf";

// Mock console.log to keep test output clean
vi.spyOn(console, "log").mockImplementation(() => {});

// Ensure test directories are cleaned up before tests
beforeAll(async () => {
  await rimraf("test-components");
  await rimraf("test-output.ts");
  await mkdirp("test-components");
});
