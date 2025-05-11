import h from "../../../lib/JSX";
import Card from "../../components/Card";

const AboutPage = () => {
  return (
    <body>
      <div class="container">
        <h1>About Stone Throw</h1>

        <div class="section">
          <h2>Framework Philosophy</h2>
          {Card(
            { title: "Our Approach" },
            <div>
              <p>
                Stone Throw is a lightweight web component framework focused on:
              </p>
              <ul>
                <li>Server-side rendering of custom elements</li>
                <li>Progressive enhancement as a core principle</li>
                <li>Modern developer experience with lightweight output</li>
                <li>Balancing React ecosystem tools with web standards</li>
              </ul>
            </div>
          )}
        </div>

        <div class="section">
          <a href="/">Return to Home</a>
        </div>
      </div>
    </body>
  );
};

export default AboutPage;
