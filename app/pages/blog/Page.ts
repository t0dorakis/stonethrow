import Card from "../../components/Card";
import NavBar from "../../components/NavBar";

const blogPosts = [
  {
    title: "This is how it compares to other frameworks",
    content:
      "The last 10 years have seen a lot of new frameworks come and go. Here's how it compares to the others.",
  },
  {
    title: "Blog Post 2",
    content: "This is the content of blog post 2",
  },
];

const BlogPage = () => {
  return /*html*/ `
    <main>
      ${NavBar()}
      <h1>Blog</h1>
      ${blogPosts.map((post) => Card({ title: post.title }, post.content))}
    </main>
  `;
};

export default BlogPage;
