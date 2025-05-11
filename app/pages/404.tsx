import type { PageEvent } from "../../lib/types";
import h from "../../lib/JSX";

const NotFoundPage = (event: PageEvent) => {
  event.node.res.statusCode = 404;

  return (
    <html lang="en">
      <head>
        <title>Page Not Found - Stone Throw</title>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page {event.path} does not exist.</p>
      </body>
    </html>
  );
};

export default NotFoundPage;
