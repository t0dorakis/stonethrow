import { setMeta } from "stone-throw/utils";

/**
 * Custom 404 page that can be freely customized
 * Will be rendered inside an HTML document with client assets and framework initialization
 */
const NotFoundPage = () => {
	return /*html*/ `
    <body>
      <div class="error-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <a href="/" class="home-link">Return to home page</a>
      </div>
    </body>
  `;
};

export const Meta = setMeta({
	title: "Page Not Found | Stone Throw",
	metaTags: [
		{ name: "description", content: "404 - Page not found" },
		{ name: "robots", content: "noindex, nofollow" },
	],
});

export default NotFoundPage;
