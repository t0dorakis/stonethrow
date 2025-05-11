import h from "../../lib/JSX";
import Card from "../components/Card";
import MiniCounter from "../components/MiniCounter";

const HomePage = () => {
  return (
    <body>
      <div class="container">
        <h1>Stone Throw - Home Page</h1>

        {/* Counters Demo */}
        <div class="section">
          <h2>Multiple Counters</h2>
          {Card(
            { title: "Counter Collection" },
            [1, 2, 3].map(() => MiniCounter())
          )}
        </div>

        {/* Navigation */}
        <div class="section navigation">
          <h2>Navigation</h2>
          <p>Try our folder-based routing system:</p>
          <ul>
            <li>
              <a href="/about">About Page</a>
            </li>
            <li>
              <a href="/blog/post">Blog Post (Nested Route)</a>
            </li>
          </ul>
        </div>
      </div>
    </body>
  );
};

export default HomePage;
