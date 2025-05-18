import type { PageEvent } from "stone-throw/types";

/**
 * Custom 500 server error page
 * Will be rendered inside an HTML document with client assets and framework initialization
 */
const ServerErrorPage = (event: PageEvent) => {
  return /*html*/ `
    <body>
      <div class="error-container">
        <h1>Server Error</h1>
        <p>Sorry, something went wrong on our server.</p>
        <p>Please try again later or contact support if the issue persists.</p>
        <div>
          <a href="/">Return to Home</a>
        </div>
      </div>
    </body>
  `;
};

export default ServerErrorPage;
