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

// FIXME: This interface is pretty bad probably now that I think about itx
/**
 * @template {Record<string, any>} Data
 * @param {string} route
 * @param {Method} method
 * @param {Record<string, any> | SvelteFetch} [payload_or_svelte_fetch]
 * @param {SvelteFetch} [svelte_fetch]
 * @returns {Promise<UnwrappedResponse & { json: Data }>}
 */
async function api_fetch(route, method, payload_or_svelte_fetch, svelte_fetch) {
	const _fetch = svelte_fetch ?? (typeof payload_or_svelte_fetch !== "function" ? fetch : payload_or_svelte_fetch);

	const payload = typeof payload_or_svelte_fetch === "object" && !Array.isArray(payload_or_svelte_fetch) ? payload_or_svelte_fetch : undefined;

	return new Promise((resolve) => {
		_fetch(route, {
			method: method,
			body: payload ? JSON.stringify(payload) : undefined,
		}).then((/** @type {Response} */ response) => response.json().then((json) => resolve({ ok: response.ok, json })));
	});
}

export { api_fetch };
