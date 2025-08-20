import { create, useRerender } from "stone-throw/client";

const Counter = create("counter", {
  state: () => ({ count: 0 }),

  server: (state, props, children) => `
    <div class="flex flex-col justify-center items-center bg-stone-100 min-w-[380px] min-h-[356px] p-6 rounded-lg border border-stone-300 max-w-sm">
      <div data-watch class="text-[80px] font-bold text-center text-copy py-4 px-6 min-w-[80px]">
        ${state.count.get()}
      </div> 
      <button class="mx-auto bg-stone-100 hover:bg-stone-200 border border-stone-300 text-copy font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-2xl">
        +
      </button>
    </div>
  `,

  client: (element, state) => {
    useRerender([state.count]);

    const button = element.querySelector("button");

    const handleClick = (event: Event) => {
      state.count.update((n: unknown) => (n as number) + 1);
    };

    button?.addEventListener("click", handleClick);

    return () => {
      button?.removeEventListener("click", handleClick);
    };
  },
});

export default Counter;
