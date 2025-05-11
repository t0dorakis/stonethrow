import h from "../../../lib/JSX";
import Card from "../../components/Card";

const BlogPage = () => {
  return (
    <body>
      <div class="container">
        <h1>Blog Post</h1>

        <div class="section">
          {Card(
            { title: "File-based Routing with Stone Throw" },
            <div>
              <p>
                This page demonstrates nested routing with Stone Throw
                framework. The URL path /blog/post maps to this component at
                app/pages/blog/PostPage.tsx.
              </p>
              <p>
                Stone Throw's file-based routing system converts URL segments to
                component names:
              </p>
              <ul>
                <li>
                  <code>/</code> → HomePage.tsx
                </li>
                <li>
                  <code>/about</code> → AboutPage.tsx
                </li>
                <li>
                  <code>/blog/post</code> → blog/PostPage.tsx
                </li>
              </ul>
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

export default BlogPage;
