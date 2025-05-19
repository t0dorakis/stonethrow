import { create } from "stone-throw/components";

const Link = create("link", {
  render: (state, props, children) => {
    const href = props?.href;

    const buttonVariant = "";

    return /*html*/ `
      <a href='${href}' class='inline-block bg-slate-300 rounded-md px-4 py-2'>
      {children}
      </a>
    `;
  },
});

export default Link;
