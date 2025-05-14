import { create } from "../../lib/Stone";

// Card component that can receive and render children
// Name will be derived from variable name (Card -> x-card)
const Card = create({
  // No state needed for this component
  render: (state, props, children) => {
    const title = (props?.title as string) || "Card";

    return /*html*/ `
      <div class="p-4 bg-white rounded-lg shadow-md w-auto">
        <div class="mb-4 text-lg font-bold">${title}</div>
        <div class="text-gray-700">${children || ""}</div>
      </div>
    `;
  },
});

export default Card;
