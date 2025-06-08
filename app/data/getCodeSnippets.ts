import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import catppuccinMacchiato from "@shikijs/themes/catppuccin-macchiato";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighter = await createHighlighterCore({
  themes: [catppuccinMacchiato],
  langs: [import("@shikijs/langs/typescript")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

const getCodeSnippets = async (name: string, lang = "typescript") => {
  // /codeSnippets/components.ts
  // const code = await fetch(`/code-snippets/${name}`).then((res) => res.text());
  // Read file directly from filesystem instead of making HTTP request
  const filePath = resolve(process.cwd(), "public/code-snippets", name);
  const code = await readFile(filePath, "utf-8");
  const html = await highlighter.codeToHtml(code, {
    lang: lang,
    theme: "catppuccin-macchiato",
  });

  return html;
};

export default getCodeSnippets;
