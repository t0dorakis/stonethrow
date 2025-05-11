import type { PageEvent } from "../../lib/types";
import h from "../../lib/JSX";

/**
 * Custom 404 page that can be freely customized
 * Will be rendered inside an HTML document with client assets and framework initialization
 */
const NotFoundPage = (event: PageEvent) => {
  return (
    <body>
      <div class="error-container">
        <h1>404 - Page Not Found</h1>
        <p>
          The page <code>{event.path}</code> does not exist.
        </p>
        <a href="/">Return to Home</a>
      </div>
    </body>
  );
};

export default NotFoundPage;
