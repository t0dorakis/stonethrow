// app/components/CodeBlock.ts
import { create } from "stone-throw/components";

const CodeBlock = create("code-block", {
  render: (state, props, children) => {
    return /*html*/ `
      <div class="rounded-lg overflow-hidden"> 
        ${props.code}
      </div>`;
  },
  init: () => {},
});

export default CodeBlock;
