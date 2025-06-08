import { codeSnippets } from "./codeSnippets";

import catppuccinMacchiato from "@shikijs/themes/catppuccin-macchiato";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighter = await createHighlighterCore({
  themes: [catppuccinMacchiato],
  langs: [import("@shikijs/langs/typescript")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

const getCodeSnippets = async (name: string, lang = "typescript") => {
  // Get code snippet from the constants
  const code = codeSnippets[name as keyof typeof codeSnippets];

  if (!code) {
    throw new Error(`Code snippet not found: ${name}`);
  }

  const html = await highlighter.codeToHtml(code, {
    lang: lang,
    theme: "catppuccin-macchiato",
  });

  return html;
};

export default getCodeSnippets;
