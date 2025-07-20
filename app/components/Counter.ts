import { create } from "stone-throw/components";
import { useRerender } from "stone-throw";

const Counter = create("counter", {
  // signal based state
  state: () => ({ count: 0 }),
  // server side
  render: (state, props, children) => `
    <div class="flex flex-col justify-center items-center bg-stone-100 min-w-[380px] min-h-[356px] p-6 rounded-lg  border border-stone-300 max-w-sm">
      <div id="display" class="text-[80px] font-bold text-center text-copy  py-4 px-6 min-w-[80px]">
        ${state.count.get()}
      </div> 
      <button class="mx-auto bg-stone-100 hover:bg-stone-200  border border-stone-300 text-copy font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-2xl">
        +
      </button>
    </div>
  `,
  // client side
  init: (element, state) => {
    const display = element.querySelector("#display");
    const button = element.querySelector("button");
    button?.addEventListener("click", () => {
      state.count.update((n: number) => n + 1);
      if (display) display.textContent = String(state.count.get());
    });
  },
});

export default Counter;
