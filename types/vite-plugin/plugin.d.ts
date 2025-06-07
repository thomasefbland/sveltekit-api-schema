export { plugin as sveltekit_api_schema };
export type EndpointDefinition = {
    route: string;
    method: import("types").Method;
    payload_type_string?: string;
    response_type_string: string;
};
/**
 * @param {string[]} api_dirs
 * @param {string} [routes_dir]
 * @returns {import('vite').Plugin}
 */
declare function plugin(api_dirs: string[], routes_dir?: string): import("vite").Plugin;
