import CounterContainer from "../components/CounterContainer";
import h from "../../lib/JSX"; // Explicitly import your JSX factory TODO: import automatically later
import Stone from "../../lib/Stone";

const HomePage = () => {
  return (
    <body>
      <my-component>
        <h1 slot="text">Stone Throw</h1>
      </my-component>

      {Stone.createCustomElement("counter-container", CounterContainer)}
    </body>
  );
};

export default HomePage;
