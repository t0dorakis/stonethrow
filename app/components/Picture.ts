import { create } from "stone-throw/components";

const Picture = create("picture", {
  // No state needed for this component
  render: (state, props, children) => {
    return /*html*/ `
    <picture class="${props.class}">
      <source srcset="${props.src}-min-0.webp" type="image/webp" />
      <source srcset="${props.src}-min-1.webp" type="image/webp" />
      <source srcset="${props.src}-min-0.png" type="image/png" />
      <source srcset="${props.src}-min-1.png" type="image/png" />
      <img src="${props.src}-min-0.png" alt="${props.alt}" />
    </picture>
    `;
  },
});

export default Picture;
