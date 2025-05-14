import Card from "../components/Card";
import MiniCounter from "../components/MiniCounter";
import NavBar from "../components/NavBar";

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
      </div>
    </div>
  `;
};

export default HomePage;
