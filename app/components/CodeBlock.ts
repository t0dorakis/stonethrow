// app/components/CodeBlock.ts
import { create } from "stone-throw/components";

const CodeBlock = create("code-block", {
  server: (state, props, children) => {
    return /*html*/ `
      <div class="rounded-lg overflow-hidden"> 
        ${props.code}
      </div>`;
  },
  client: (element, state) => {
    return () => {};
  },
});

export default CodeBlock;
