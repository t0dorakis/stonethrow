import { Plugin } from 'vite';

interface StoneAutoRegistryOptions {
    componentsDir: string;
    output: string;
    extensions?: string[];
}
declare function stoneAutoRegistry(options: StoneAutoRegistryOptions): Plugin;

export { stoneAutoRegistry as default };
