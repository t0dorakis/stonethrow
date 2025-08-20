import { create } from "stone-throw/components";
import Logo from "./Logo";

const navItems = [
  { label: "Blog", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
] as const;

const leftPill = /*html*/ `
      <div class="flex flex-row bg-primary-500  px-4 py-3 rounded-[20px]">
        ${Logo()}
        <div class="flex items-center text-stone-900 ml-4 gap-3">
              ${navItems
                .map(
                  (item) => /*html*/ `
                <a href="${item.href}" class="text-stone-900 hover:underline">${item.label}</a>
              `
                )
                .join("")}
          </div>
      </div>
    `;

const NavBar = create("nav-bar", {
  server: (state, props, children) => {
    return /*html*/ `
        <nav class="flex items-center gap-4 w-auto rounded-md py-1">
          ${leftPill}
        </nav>
    `;
  },
});

export default NavBar;
