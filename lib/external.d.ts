declare namespace JSX {
  type Element = string;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
interface Window {
  FRAMEWORK?: {
    componentRegistry?: string[];
  };
}
