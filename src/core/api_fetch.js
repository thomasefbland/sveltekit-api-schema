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

// FIXME: This interface is pretty bad probably now that I think about itx
/**
 * @template {Record<string, any>} Data
 * @param {FetchOptions} options
 * @returns {Promise<UnwrappedResponse<Data>>}
 */
export async function api_fetch(options) {
	const { route, method, payload, svelte_fetch } = options;

	const headers = /** @type {HeadersInit} */ (payload ? [["Content-Type", "application/json"]] : []);

	const _fetch = svelte_fetch ?? fetch;
	return new Promise((resolve) => {
		_fetch(route, {
			method: method,
			headers: headers,
			body: payload ? JSON.stringify(payload) : undefined,
		}).then((/** @type {Response} */ response) => response.json().then((json) => resolve({ ok: response.ok, json })));
	});
}
