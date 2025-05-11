import h from "./JSX";
import Stone from "./Stone";
import type { PageEvent } from "./types";
import { loadClientAssets } from "./client-assets";
import type { ClientAsset } from "./client-assets";
import { logger } from "./logging";

/**
 * Render the document head with meta tags, title, and client assets
 * @param clientAssets Array of client assets to include in head
 * @param clientEntry Path to the client entry script
 * @param title Page title
 * @returns Rendered head element
 */
function renderHead(
	clientAssets: ClientAsset[],
	clientEntry: string,
	title = "Stone Throw",
) {
	return (
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>{title}</title>

			{/* Include all client assets (CSS, preloads, etc.) */}
			{renderClientAssets(clientAssets)}

			<script type="module" src={clientEntry} defer />
		</head>
	);
}

/**
 * Render the framework initialization script
 * @returns Rendered script element
 */
function renderFrameworkScript() {
	return (
		<script type="module">
			{`
        window.FRAMEWORK = {
          componentsToRegister: ${JSON.stringify(Stone.getComponentsToRegister())}
        };
      `}
		</script>
	);
}

/**
 * Render a complete HTML page with client assets and registry
 * @param PageComponent The component to render in the page
 * @param event The page event
 * @returns Rendered HTML string
 */
export async function renderPage(
	PageComponent: (event: PageEvent) => string,
	event: PageEvent,
) {
	try {
		// Load client assets
		const { clientAssets, clientEntry } = await loadClientAssets();

		// Render the page with client assets and registry
		return (
			<html lang="en">
				{renderHead(clientAssets, clientEntry)}
				{/* Render the page component */}
				{PageComponent(event)}
				{/* Hand the serverside registry keys over to the client */}
				{renderFrameworkScript()}
			</html>
		);
	} catch (error) {
		logger.error("Error in renderPage:", error);
		return renderErrorPage("Failed to render page", 500);
	}
}

/**
 * Render a 404 or error page
 * @param event The page event
 * @param ErrorComponent The error component to render
 * @returns Rendered HTML string
 */
export async function renderErrorWithComponent(
	event: PageEvent,
	ErrorComponent: (event: PageEvent) => string,
	statusCode = 404,
) {
	try {
		event.node.res.statusCode = statusCode;

		// Load client assets
		const { clientAssets, clientEntry } = await loadClientAssets();
		const title = `${statusCode === 404 ? "Not Found" : "Error"} - Stone Throw`;

		return (
			<html lang="en">
				{renderHead(clientAssets, clientEntry, title)}
				<body>
					{/* Directly include the ErrorComponent content */}
					{ErrorComponent(event)}
				</body>
				{/* Add framework initialization for error pages too */}
				{renderFrameworkScript()}
			</html>
		);
	} catch (error) {
		logger.error("Error in renderErrorWithComponent:", error);
		return renderErrorPage("Failed to render error page", statusCode);
	}
}

/**
 * Render a simple error page when something goes wrong
 * @param message Error message to display
 * @param statusCode HTTP status code
 * @returns Rendered HTML string
 */
export function renderErrorPage(message: string, statusCode = 500) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{statusCode === 404 ? "Not Found" : "Server Error"}</title>
			</head>
			<body>
				<h1>{statusCode === 404 ? "Not Found" : "Server Error"}</h1>
				<p>{message}</p>
			</body>
		</html>
	);
}

/**
 * Helper function to render client assets
 * @param assets Array of client assets
 * @returns Rendered asset elements
 */
function renderClientAssets(assets: ClientAsset[]) {
	return assets.map((asset) => {
		// Add styles directly into the head
		if (asset.tag === "style") {
			return <style>{asset.children}</style>;
		}

		// Add links (CSS, preloads, etc.)
		if (asset.tag === "link" && asset.attrs?.href) {
			return <link key={asset.attrs.href} {...asset.attrs} />;
		}

		return null;
	});
}
