import Picture from "../components/Picture";
import StoneVideo from "../components/StoneVideo";
import { setMeta } from "stone-throw/utils";

const HomePage = () => {
  return /*html*/ `
    <main class="flex flex-col min-h-screen w-full m-0 mx-auto ">
      <div class="flex flex-col md:flex-row h-full min-h-screen">
        <div class="w-full md:w-1/2 bg-surface">
          <h1 class="text-copy text-4xl font-bold p-8 leading-tighter tracking-tighter">
          stoneThrow is web standard based SSR framework—which makes heavy use of modern javascript stacks.
          </h1>
        </div>
        <div class="w-full md:w-1/2 bg-primary-200 flex items-center justify-center">
          ${StoneVideo({
            src: "/stone_rotation",
            alt: "Just a Stone",
            poster: "/stone_poster-min-0.png",
          })}
        </div>
      </div>
    </main>
  `;
};

/**
 * Optional Meta tags for the home page
 */
export const Meta = setMeta({
  title: "Home",
  metaTags: [
    {
      name: "description",
      content: "This is the home page",
    },
  ],
});

export default HomePage;
