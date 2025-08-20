import { create } from "stone-throw/components";

const Logo = create("logo", {
  server: (state, props, children) => {
    return /*html*/ `
      <img src="/Stone_Logo.svg" alt="StoneThrow" />
    `;
  },
});

export default Logo;
