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

  it("generates registry with configResolved hook for early execution", async () => {
    // Setup test files
    await mkdirp(TEST_DIR);
    await fs.writeFile(join(TEST_DIR, "Button.ts"), "export default {}");

    const plugin = stoneAutoRegistry({
      componentsDir: TEST_DIR,
      output: OUTPUT_FILE,
    });

    // Make sure the file doesn't exist yet
    try {
      await fs.access(OUTPUT_FILE);
      await fs.unlink(OUTPUT_FILE); // Delete if it exists
    } catch (e) {
      // File doesn't exist, which is what we want
    }

    // Access the configResolved hook handler
    const configResolvedHook = (plugin as any).configResolved as Function;

    // Execute the hook
    if (configResolvedHook) {
      await configResolvedHook();
    }

    // Verify file was created early by the configResolved hook
    const fileExists = await fs
      .access(OUTPUT_FILE)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    // Verify content
    const output = await fs.readFile(OUTPUT_FILE, "utf-8");
    expect(output).toContain(
      '"s-button": () => import("./test-components/Button")'
    );
  });

  it("creates empty registry if components directory doesn't exist", async () => {
    // Ensure the directory doesn't exist
    await rimraf(TEST_DIR);

    const plugin = stoneAutoRegistry({
      componentsDir: TEST_DIR,
      output: OUTPUT_FILE,
    });

    // Access the buildStart hook handler
    const buildStartHook = (plugin as Plugin).buildStart as Function;
    await buildStartHook();

    // Verify a minimal empty registry was created
    const output = await fs.readFile(OUTPUT_FILE, "utf-8");
    expect(output).toContain("export const stoneComponentRegistry = {}");

    // Verify the directory was created
    const dirExists = await fs
      .access(TEST_DIR)
      .then(() => true)
      .catch(() => false);
    expect(dirExists).toBe(true);
  });
});
