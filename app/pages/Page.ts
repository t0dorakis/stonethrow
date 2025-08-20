import Link from "../components/Link";
import StoneVideo from "../components/StoneVideo";
import { setMeta } from "@stonethrow/core/utils";
import getCodeSnippets from "../data/getCodeSnippets";
import CodeBlock from "../components/CodeBlock";
import Counter from "../components/Counter";
import NavBar from "../components/NavBar";

const HomePage = async () => {
  const counterSnippet = await getCodeSnippets("counter");

  return /*html*/ `
    <main id="home-page" class="flex flex-col min-h-screen w-full m-0 mx-auto ">
      <section id="hero-section" class="flex flex-col md:flex-row h-full min-h-screen">
        <div class="w-full md:w-1/2 bg-surface  p-8 flex flex-col gap-4">
          ${NavBar()}
          <h1 class="max-w-[20ch] text-copy mt-auto text-4xl font-bold leading-tighter tracking-tighter">
            Modern, Server‑Rendered Web Components.
          </h1>
        </div>
        <div class="w-full md:w-1/2 relative bg-primary-200 flex items-center justify-center">
          <a href="/" class="absolute top-8 right-8 text-copy h-14 font-bold bg-secondary-300 px-4 py-2 rounded-[20px] flex items-center justify-center">
           Get Started
          </a>
          <h2 class="text-copy absolute z-10 top-auto bottom-auto left-4 font-display text-[100px] lg:text-[150px] leading-none">
            Throw the first Stone
          </h2>
          <div class="mt-auto overflow-clip">
          ${StoneVideo({
            src: "/stone_rotation",
            alt: "Just a Stone",
            poster: "/stone_poster-min-0.png",
            class: "scale-110",
          })}
          </div>
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
