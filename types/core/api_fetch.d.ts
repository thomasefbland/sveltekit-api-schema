/**
 * @template {Record<string, any>} Data
 * @typedef {Object} UnwrappedSuccessfulResponse
 * @property {true} ok
 * @property {Data} json
 */
/**
 * @typedef {Object} UnwrappedFailedResponse
 * @property {false} ok
 * @property {{ message: string }} json
 */
/**
 * @template {Record<string, any>} Data
 * @typedef {UnwrappedSuccessfulResponse<Data> | UnwrappedFailedResponse} UnwrappedResponse
 */
/**
 * @callback SvelteFetch
 * @param {RequestInfo | URL | string | globalThis.Request} input
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
/**
 * @typedef {'GET' | 'POST'} Method
 */
/**
 * @typedef {{ route: string; method: Method; payload: Record<string, any> | undefined; svelte_fetch?: SvelteFetch }} FetchOptions
 */
export type UnwrappedSuccessfulResponse<Data extends Record<string, any>> = {
	ok: true;
	json: Data;
};
export type UnwrappedFailedResponse = {
	ok: false;
	json: {
		message: string;
	};
};
export type UnwrappedResponse<Data extends Record<string, any>> = UnwrappedSuccessfulResponse<Data> | UnwrappedFailedResponse;
export type SvelteFetch = (input: RequestInfo | URL | string | globalThis.Request, init?: RequestInit | undefined) => Promise<Response>;
export type Method = "GET" | "POST";
export type FetchOptions = {
	route: string;
	method: Method;
	payload: Record<string, any> | undefined;
	svelte_fetch?: SvelteFetch;
};
