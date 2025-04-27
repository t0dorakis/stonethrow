import CustomElementButton from "../customElementButton";
import h from "../../../lib/JSX"; // Explicitly import your JSX factory TODO: import automatically later
import { createCustomElement } from "../../serverRegistryUtils";

const homePage = () => {
  return (
    <body>
      <my-component>
        <h1 slot="text">Stone Throw</h1>
      </my-component>

      {createCustomElement("custom-element-button", CustomElementButton)}
    </body>
  );
};

export default homePage;
