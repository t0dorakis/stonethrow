import { defineConfig } from "vite";

const Plugin = () =>
  defineConfig({
    esbuild: {
      jsxFactory: "h",
      jsxFragment: "Fragment",
      jsxInject: `import './lib/global.ts'`, // Inject global script
    },
  });

export default Plugin;
