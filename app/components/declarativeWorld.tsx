import h from "../../lib/JSX"; // Explicitly import your JSX factory

const SSR = (child) => {
  // return "hallo";
  return (
    <declarative-button>
      <template shadowrootmode="open">
        <button className="declarative-button">
          Click Me<slot></slot>
        </button>
      </template>
    </declarative-button>
  );
};

export const module = () => {
  customElements.define("declarative-world", DeclarativeWorld);
};

export default SSR;
