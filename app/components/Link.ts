import { create } from "stone-throw/components";

const Link = create("link", {
  render: (state, props, children) => {
    const href = props?.href;

    const buttonVariant = props?.variant;

    return /*html*/ `
      <a href="${href}" class="inline-flex justify-center items-center py-3 px-5 text-center text-copy rounded-lg bg-secondary-300 hover:bg-primary-300 focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-900">
          ${children}
          ${
            buttonVariant === "arrow" &&
            /*html*/ `
              <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            `
          }
      </a>
    `;
  },
});

export default Link;
