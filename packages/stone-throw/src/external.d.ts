declare module "stone-throw" {
	export interface StoneComponent {
		name: string;
		template: string;
	}

	// Add the Stone export
	export const Stone: {
		init: (componentRegistry: Record<string, unknown>) => void;
		getComponentsToRegister: () => Record<string, unknown>;
	};
}

declare module "stone-throw/utils" {
	export const logger: {
		info: (...args: unknown[]) => void;
		warn: (...args: unknown[]) => void;
		error: (...args: unknown[]) => void;
		withTag: (tag: string) => {
			info: (...args: unknown[]) => void;
			warn: (...args: unknown[]) => void;
			error: (...args: unknown[]) => void;
		};
	};

	export interface Meta {
		title?: string;
		metaTags?: Array<Record<string, string>>;
	}

	export const setMeta: (meta: Meta) => Meta;
	export const signal: <T>(initialValue: T) => {
		get: () => T;
		set: (value: T) => void;
		update: (updater: (prev: T) => T) => void;
		effect: (callback: (value: T) => void) => () => void;
	};
}

declare module "stone-throw/rendering" {
	import type { PageEvent } from "stone-throw/types";
	import type { Meta } from "stone-throw/utils";

	export const renderPage: (
		PageComponent: (event: PageEvent) => string & { Meta?: Meta },
		event: PageEvent,
	) => Promise<string>;

	export const handleError: (
		event: PageEvent,
		statusCode: number,
		error?: unknown,
		importFunction?: (code: number) => Promise<(event: PageEvent) => string>,
	) => Promise<string>;
}

declare module "stone-throw/types" {
	export interface PageEvent {
		node: {
			req: unknown;
			res: {
				statusCode: number;
			};
		};
		context: Record<string, unknown>;
		path: string;
	}

	export type PageComponent = (event: PageEvent) => string;
}

declare module "stone-throw/routing" {
	export class PagesRouter {
		constructor(
			options: {
				dir: string;
				extensions: string[];
				ignore: string[];
			},
			router: unknown,
			app: unknown,
		);
	}
}
