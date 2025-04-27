import h from "./JSX";
// @ts-expect-error h is a global variable
globalThis.h = h;