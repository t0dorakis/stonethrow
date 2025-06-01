import { getBaseUrl } from "./getBaseUrl";

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
  const code = await fetch(`${getBaseUrl()}/code-snippets/${name}.txt`).then(
    (res) => res.text()
  );

  const html = await highlighter.codeToHtml(code, {
    lang: lang,
    theme: "catppuccin-macchiato",
  });

  return html;
};

export default getCodeSnippets;
