import type { PageEvent } from "../../lib/types";
import h from "../../lib/JSX";

const NotFoundPage = (event: PageEvent) => {
	return (
		<div>
			<h1>404 - Page Not Found</h1>
			<p>The page {event.path} does not exist.</p>
			<a href="/">Return to Home</a>
		</div>
	);
};

export default NotFoundPage;
