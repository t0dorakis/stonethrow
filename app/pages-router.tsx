import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import { loadPageComponent } from "../lib/page-loader";
import Stone from "../lib/Stone";
import h from "../lib/JSX";
import NotFoundPage from "./pages/404";

export default eventHandler({
	handler: async (event) => {
		const clientManifest = getManifest("client");
		const clientAssets =
			await clientManifest.inputs[clientManifest.handler].assets();
		const clientEntry =
			clientManifest.inputs[clientManifest.handler].output.path;

		// Load the correct page component based on the path
		const PageComponent = await loadPageComponent(event);

		// Return 404 if page not found
		if (!PageComponent) {
			return NotFoundPage(event);
		}

		return (
			<html lang="en">
				<head>
					<title>Stone Throw</title>
					<meta
						name="description"
						content="A simple framework for building web components with
            server-side rendering"
					/>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>

					{/* Include all client assets (CSS, preloads, etc.) */}
					{clientAssets.map((asset) => {
						// bang the style directly into the head
						if (asset.tag === "style") {
							return <style>{asset.children}</style>;
						}

						if (asset.tag === "link" && asset.attrs?.href) {
							return <link key={asset.attrs.href} {...asset.attrs} />;
						}
						return null;
					})}

					<script type="module" src={clientEntry} defer />
				</head>
				{PageComponent(event)}
				{/* Hand the serverside registry keys over to the client */}
				<script type="module">
					{`
              window.FRAMEWORK = {
                componentsToRegister: ${JSON.stringify(
									Stone.getComponentsToRegister(),
								)}
              };
            `}
				</script>
			</html>
		);
	},
});
