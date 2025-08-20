import { setMeta } from "@stonethrow/core/utils";

/**
 * Custom 500 server error page
 * Will be rendered inside an HTML document with client assets and framework initialization
 */
const ServerErrorPage = () => {
	return /*html*/ `
    <body>
      <div class="error-container">
        <h1>500 - Server Error</h1>
        <p>Sorry, something went wrong on our server. Please try again later.</p>
        <a href="/" class="home-link">Return to home page</a>
      </div>
    </body>
  `;
};

export const Meta = setMeta({
	title: "Server Error | Stone Throw",
	metaTags: [
		{ name: "description", content: "500 - Server error" },
		{ name: "robots", content: "noindex, nofollow" },
	],
});

export default ServerErrorPage;
