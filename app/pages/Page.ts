import Link from "../components/Link";
import StoneVideo from "../components/StoneVideo";
import { setMeta } from "stone-throw/utils";
import getCodeSnippets from "../data/getCodeSnippets";
import CodeBlock from "../components/CodeBlock";
import Counter from "../components/Counter";

const HomePage = async () => {
  const counterSnippet = await getCodeSnippets("counter");

  return /*html*/ `
    <main id="home-page" class="flex flex-col min-h-screen w-full m-0 mx-auto ">
      <section id="hero-section" class="flex flex-col md:flex-row h-full min-h-screen">
        <div class="w-full md:w-1/2 bg-surface  p-8 flex flex-col gap-4">
          <h1 class="text-copy text-4xl font-bold leading-tighter tracking-tighter">
          stoneThrow is web standard based SSR framework—which makes heavy use of modern javascript stacks.
          </h1>
          ${Link(
            {
              href: "/",
              variant: "arrow",
            },
            "Get started"
          )}
        </div>
        <div class="w-full md:w-1/2 bg-primary-200 flex items-center justify-center">
          ${StoneVideo({
            src: "/stone_rotation",
            alt: "Just a Stone",
            poster: "/stone_poster-min-0.png",
          })}
        </div>
      </section>
      <section class="flex flex-col md:flex-row h-full min-h-screen">
      <div class="w-full md:w-1/2 bg-primary-200 flex items-center justify-center">
        ${CodeBlock({
          code: counterSnippet,
        })}
        </div>
          <div class="w-full md:w-1/2 bg-surface flex items-center justify-center">
        ${Counter()}
        </div>
      </section>
    </main>
  `;
};

export const Meta = setMeta({
  title: "Stone Throw - The Web-First Framework",
  metaTags: [
    {
      name: "description",
      content:
        "Build fast web apps with server-rendered web components and progressive enhancement. No complexity, just clean code.",
    },
    {
      name: "keywords",
      content:
        "web components, SSR, progressive enhancement, web framework, TypeScript",
    },
    { property: "og:title", content: "Stone Throw - The Web-First Framework" },
    {
      property: "og:description",
      content: "Server-first web components that enhance progressively",
    },
  ],
});
export default HomePage;
