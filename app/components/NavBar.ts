import { create } from "stone-throw/components";

const navItems = [{ label: "Blog", href: "/blog" }] as const;

const NavBar = create("nav-bar", {
  render: (state, props, children) => {
    return /*html*/ `
      <section class="flexp-4 w-auto items-start mx-8 mt-4">
        <nav class="flex items-center gap-4 w-auto border-1 border-stone-200 rounded-md px-4 py-3">
          <div class="flex items-baseline  text-stone-900  gap-4 w-auto">
            <div class="text-xl font-bold align-baseline">
              <a href="/" class="text-stone-900 hover:-rotate-3 inline-block transition-transform duration-50">Stone</a>
            </div>
            <div class="flex items-end gap-3">
              ${navItems
                .map(
                  (item) => /*html*/ `
                <a href="${item.href}" class="text-stone-900 hover:underline">${item.label}</a>
              `
                )
                .join("")}
            </div>
          </div>
        </nav>
      </section>
    `;
  },
});

export default NavBar;
