import { create } from "../../lib/Stone";
import h from "../../lib/JSX";

// Card component that can receive and render children
// Name will be derived from variable name (Card -> card)
const Card = create({
  // No state needed for this component

  render: (state, props, children) => {
    const title = (props?.title as string) || "Card";

    return `
      <div class="card">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="card-body">
          ${children || ""}
        </div>
      </div>
    `;
  },
});

export default Card;
