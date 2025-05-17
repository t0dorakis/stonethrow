import { describe, it, expect, afterEach } from "vitest";
import { promises as fs } from "fs";
import { join } from "path";
import stoneAutoRegistry from "./index";
import { mkdirp } from "mkdirp";
import { rimraf } from "rimraf";
import type { Plugin } from "vite";

const TEST_DIR = "test-components";
const OUTPUT_FILE = "test-output.ts";

describe("stoneAutoRegistry Vite plugin", () => {
  afterEach(async () => {
    await rimraf(TEST_DIR);
    await rimraf(OUTPUT_FILE);
  });

  it("generates correct registry for simple components", async () => {
    // Setup test files
    await mkdirp(TEST_DIR);
    await fs.writeFile(join(TEST_DIR, "Card.ts"), "export default {}");
    await fs.writeFile(join(TEST_DIR, "MiniCounter.tsx"), "export default {}");

    const plugin = stoneAutoRegistry({
      componentsDir: TEST_DIR,
      output: OUTPUT_FILE,
    });

    // Access the buildStart hook handler
    const buildStartHook = (plugin as Plugin).buildStart as Function;
    await buildStartHook();

    const output = await fs.readFile(OUTPUT_FILE, "utf-8");
    expect(output).toContain(
      '"s-card": () => import("./test-components/Card")'
    );
    expect(output).toContain(
      '"mini-counter": () => import("./test-components/MiniCounter")'
    );
  });

  it("adds s- prefix to components without hyphen", async () => {
    await mkdirp(TEST_DIR);
    await fs.writeFile(join(TEST_DIR, "Card.ts"), "export default {}");

    const plugin = stoneAutoRegistry({
      componentsDir: TEST_DIR,
      output: OUTPUT_FILE,
    });

    const buildStartHook = (plugin as Plugin).buildStart as Function;
    await buildStartHook();

    const output = await fs.readFile(OUTPUT_FILE, "utf-8");
    expect(output).toContain(
      '"s-card": () => import("./test-components/Card")'
    );
  });

  it("preserves existing hyphens in component names", async () => {
    await mkdirp(TEST_DIR);
    await fs.writeFile(join(TEST_DIR, "mini-counter.ts"), "export default {}");

    const plugin = stoneAutoRegistry({
      componentsDir: TEST_DIR,
      output: OUTPUT_FILE,
    });

    const buildStartHook = (plugin as Plugin).buildStart as Function;
    await buildStartHook();

    const output = await fs.readFile(OUTPUT_FILE, "utf-8");
    expect(output).toContain(
      '"mini-counter": () => import("./test-components/mini-counter")'
    );
  });
});
