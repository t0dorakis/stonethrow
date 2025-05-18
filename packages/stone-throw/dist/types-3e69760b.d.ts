import { a as SignalType } from './sgnls-43d2c4b0.js';

interface PageEvent {
    node: {
        req: any;
        res: {
            statusCode: number;
        };
    };
    context: Record<string, any>;
    path: string;
}
type PageComponent = (event: PageEvent) => string;
interface ComponentWithInternalProps {
    (props?: Props, children?: unknown): string;
    module: () => void;
    state: Record<string, SignalType<unknown>>;
    _$$name?: string;
    componentName?: string;
    ssr: (props?: Props, children?: unknown) => string;
}
type Props = Record<string, unknown>;
type ElementHandler = (element: HTMLElement, state: Record<string, SignalType<unknown>>) => void;
type StateFactory = () => Record<string, unknown>;
type ComponentOptions = {
    name?: string;
    state?: StateFactory | Record<string, unknown>;
    /**
     * Server-side render function with state parameter
     * @param state - The state of the component
     * @param props - The props of the component
     * @param children - The children of the component
     * @returns The HTML string of the component
     */
    render: (state: Record<string, SignalType<unknown>>, props?: Props, children?: string) => string;
    init?: ElementHandler;
    cleanup?: ElementHandler;
};

export { ComponentOptions as C, PageEvent as P, PageComponent as a, Props as b, ComponentWithInternalProps as c };
