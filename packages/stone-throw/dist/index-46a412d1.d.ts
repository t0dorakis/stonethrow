import { S as Signal } from './sgnls-43d2c4b0.js';
import { C as ComponentOptions, b as Props, c as ComponentWithInternalProps } from './types-3e69760b.js';

/**
 * Create a component with a clean, declarative API
 * Name will be derived from the variable it's assigned to, or can be explicitly provided.
 */
declare function createComponent(nameOrOptions: string | ComponentOptions, optionsParam?: ComponentOptions): {
    (props?: Props, children?: unknown): string;
    module(): void;
    state: {
        [k: string]: Signal<unknown>;
    };
    ssr(props?: Props, children?: unknown): string;
};
declare const create: typeof createComponent;

/**
 * @context: client-side
 * @description: asynchronously initialize all registered custom elements by loading the modules
 */
declare function initializeCustomElements(stoneComponentRegistry: Record<string, () => Promise<{
    default: {
        module: () => void;
    };
}>>): Promise<void>;

declare const index_createComponent: typeof createComponent;
declare const index_create: typeof create;
declare const index_initializeCustomElements: typeof initializeCustomElements;
declare const index_ComponentOptions: typeof ComponentOptions;
declare const index_ComponentWithInternalProps: typeof ComponentWithInternalProps;
declare const index_Props: typeof Props;
declare namespace index {
  export {
    index_createComponent as createComponent,
    index_create as create,
    index_initializeCustomElements as initializeCustomElements,
    index_ComponentOptions as ComponentOptions,
    index_ComponentWithInternalProps as ComponentWithInternalProps,
    index_Props as Props,
  };
}

export { create as a, initializeCustomElements as b, createComponent as c, index as i };
