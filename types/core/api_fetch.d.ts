/**
 * @typedef {Object} UnwrappedSuccessfulResponse
 * @property {true} ok
 * @property {Record<string, any>} json
 */
/**
 * @typedef {Object} UnwrappedFailedResponse
 * @property {false} ok
 * @property {{ message: string }} json
 */
/**
 * @typedef {UnwrappedSuccessfulResponse | UnwrappedFailedResponse} UnwrappedResponse
 */
/**
 * @callback SvelteFetch
 * @param {RequestInfo | URL | string | globalThis.Request} input
 * @param {RequestInit} [init]
 * @returns {Promise<Response>}
 */
/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} Method
 */
export type UnwrappedSuccessfulResponse = {
	ok: true;
	json: Record<string, any>;
};
export type UnwrappedFailedResponse = {
	ok: false;
	json: {
		message: string;
	};
};
export type UnwrappedResponse = UnwrappedSuccessfulResponse | UnwrappedFailedResponse;
export type SvelteFetch = (input: RequestInfo | URL | string | globalThis.Request, init?: RequestInit | undefined) => Promise<Response>;
export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
