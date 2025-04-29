import h from "../../lib/JSX";
import MiniCounter from "../components/MiniCounter";
import Card from "../components/Card";

const HomePage = () => {
  return (
    <body>
      <div class="container">
        <h1>Stone Throw</h1>

        {/* Counters in a Card */}
        <div class="section">
          <h2>Multiple Counters</h2>
          {Card(
            { title: "Counter Collection" },
            // Now we can directly pass arrays of components
            [1, 2, 3].map(() => MiniCounter())
          )}
        </div>
      </div>
    </body>
  );
};

export default HomePage;
