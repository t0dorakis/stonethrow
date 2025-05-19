import { m as markComponentForRegistration, i as initializeCustomElements } from './registryUtils.mjs';
import { s as signal } from './sgnls.mjs';
import { l as logger } from './logging.mjs';

logger.withTag("componentDefinition");
function validateElementName(input) {
  let result = input;
  if (!result.includes("-")) {
    result = `s-${result}`;
  }
  if (!/^[a-z]/i.test(result)) {
    result = `s-${result}`;
  }
  return result;
}
function processChildren(children) {
  if (children == null) {
    return "";
  }
  if (Array.isArray(children)) {
    return children.map((child) => processChildren(child)).join("");
  }
  if (typeof children === "string") {
    return children;
  }
  return String(children);
}
function createComponent(nameOrOptions, optionsParam) {
  const isStringName = typeof nameOrOptions === "string";
  const options = isStringName && optionsParam ? optionsParam : nameOrOptions;
  const initialName = isStringName ? nameOrOptions : options.name || "s-component";
  const name = validateElementName(initialName);
  const initialState = typeof options.state === "function" ? options.state() : options.state || {};
  const globalStateSignals = Object.fromEntries(
    Object.entries(initialState).map(([key, value]) => [key, signal(value)])
  );
  const wrapWithTag = (content) => {
    const trimmed = content.trim();
    if (trimmed.startsWith(`<${name}`)) {
      return trimmed;
    }
    return `<${name}>${trimmed}</${name}>`;
  };
  const Component = (props, children) => {
    markComponentForRegistration(name);
    const processedChildren = processChildren(children);
    const renderedContent = options.render(
      globalStateSignals,
      props,
      processedChildren
    );
    return wrapWithTag(renderedContent);
  };
  Component.module = () => {
    class CustomElement extends HTMLElement {
      constructor() {
        super();
        const instanceState = typeof options.state === "function" ? options.state() : options.state ? JSON.parse(JSON.stringify(options.state)) : {};
        this.stateSignals = Object.fromEntries(
          Object.entries(instanceState).map(([key, value]) => [
            key,
            signal(value)
          ])
        );
      }
      connectedCallback() {
        if (options.init) {
          options.init(this, this.stateSignals);
        }
      }
      disconnectedCallback() {
        if (options.cleanup) {
          options.cleanup(this, this.stateSignals);
        }
      }
    }
    const componentName = Component._$$name || name;
    if (!customElements.get(componentName)) {
      customElements.define(componentName, CustomElement);
    }
  };
  Component.state = globalStateSignals;
  Component.ssr = (props, children) => {
    return Component(props, children);
  };
  return Component;
}
const create = createComponent;

const index = {
  __proto__: null,
  createComponent: createComponent,
  create: create,
  initializeCustomElements: initializeCustomElements
};

export { create as a, createComponent as c, index as i };
