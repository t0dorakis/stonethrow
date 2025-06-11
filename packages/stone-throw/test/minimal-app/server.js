import { eventHandler } from "vinxi/http";
import TestCounter from "./TestCounter.js";

export default eventHandler({
	handler: async (event) => {
		console.log("Server handling request for:", event.path);

		// Render the test counter component
		const counterHtml = TestCounter();
		console.log("Counter HTML:", counterHtml);

		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stone Throw Test</title>
</head>
<body>
  <h1>Stone Throw useRerender Test</h1>
  ${counterHtml}
  
  <!-- Framework init script -->
  <script type="module">
    console.log("Framework init script running");
    window.__STONE__ = {
      componentsToRegister: ["test-counter"]
    };
    console.log("__STONE__ set:", window.__STONE__);
  </script>
  
  <!-- Client bundle -->
  <script type="module" src="/_build/client.js"></script>
</body>
</html>`;
	},
});
