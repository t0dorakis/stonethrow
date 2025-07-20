import { eventHandler } from "vinxi/http";
import TestCounter from "./components/TestCounter";
import TestInput from "./components/TestInput";
import { renderPage } from "stone-throw/rendering";

const Page = () => {
	return `
    <body>
      <h1>Stone Throw useRerender Test</h1>
      ${TestCounter()}
      <hr>
      ${TestInput()}
    </body>
  `;
};
export default eventHandler({
	handler: async (event) => {
		console.log("Server handling request for:", event.path);

		// Render the test counter component
		return await renderPage(Page, event);
	},
});
