import h from "../../../../lib/JSX";
import Card from "../../../components/Card";

const Page = () => {
  return (
    <body>
      <div class="container">
        <h1>Blog Post</h1>

        <div class="section">
          {Card(
            { title: "Folder-based Routing with Stone Throw" },
            <div>
              <p>
                This page demonstrates folder-based routing with Stone Throw
                framework. The URL path /blog/post maps to this component at
                app/pages/blog/post/Page.tsx.
              </p>
              <p>
                Stone Throw's folder-based routing system maps URL segments
                directly to folders:
              </p>
              <ul>
                <li>
                  <code>/</code> → app/pages/Page.tsx
                </li>
                <li>
                  <code>/about</code> → app/pages/about/Page.tsx
                </li>
                <li>
                  <code>/blog/post</code> → app/pages/blog/post/Page.tsx
                </li>
              </ul>
              <p>
                This approach makes the routing structure more intuitive and
                allows for cleaner organization of page components.
              </p>
            </div>
          )}
        </div>

        <div class="section navigation">
          <a href="/">Home</a> | <a href="/about">About</a>
        </div>
      </div>
    </body>
  );
};

export default Page;
