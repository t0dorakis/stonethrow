import Card from "../components/Card";
import MiniCounter from "../components/MiniCounter";
import NavBar from "../components/NavBar";
import { setMeta } from "stone-throw/utils";

const HomePage = () => {
  return /*html*/ `
    <main class="flex flex-col h-full w-full m-0 max-w-screen-lg mx-auto">
      ${NavBar()}
      <section class="p-8">
        <h2>Multiple Counters</h2>
        ${Card(
          { title: "Counter Collection" },
          [1, 2, 3].map(() => MiniCounter())
        )}
      </section>
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
