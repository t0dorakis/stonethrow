import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    { input: "src/index", name: "index" },
    { input: "src/components/index", name: "components" },
    { input: "src/rendering/index", name: "rendering" },
    { input: "src/routing/index", name: "routing" },
    { input: "src/utils/index", name: "utils" },
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
