type Meta = {
    title?: string;
    metaTags?: Array<Record<string, string>>;
};
/**
 * Simple helper to set the meta tags for the page
 * @param meta The meta tags to set
 * @returns The meta tags
 */
declare const setMeta: (meta: Meta) => {
    title: string | undefined;
    metaTags: Record<string, string>[] | undefined;
};

export { Meta as M, setMeta as s };
