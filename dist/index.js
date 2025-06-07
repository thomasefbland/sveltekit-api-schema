const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;

const SEE_OTHER = 303;

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;

const SERVER_ERROR = 500;

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

/**
 * @type {Record<import("types").ApiHttpCode, string>}
 */
const DEFAULT_MESSAGES = {
	200: "OK",
	201: "Created",
	204: "No Content",
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	500: "Internal Server Error",
};

/**
 * @typedef {Record<string, any>} Dict
 */

/**
 * @typedef {Response & {
 *   ok: true,
 *   json: () => Promise<Dict>
 * }} SuccessfulAPIResponse
 */

/**
 * @typedef {Response & {
 *   ok: false
 * }} FailedAPIResponse
 */

/**
 * @typedef {SuccessfulAPIResponse | FailedAPIResponse} APIResponseWithoutData
 */

/**
 * @template T
 * @typedef {SuccessfulAPIResponse & { json(): Promise<T> } | FailedAPIResponse} APIResponseWithData
 */

/**
 * Respond with just a status code.
 * @param {import("types").ApiHttpCode} status_code
 * @returns {Promise<APIResponseWithoutData>}
 */

/**
 * Respond with a status code and message.
 * @param {import("types").ApiHttpCode} status_code
 * @param {string} message_or_data
 * @returns {Promise<APIResponseWithoutData>}
 */

/**
 * @template {Dict} Data
 * Respond with status code, message, and data.
 * @param {import("types").ApiHttpCode} status_code
 * @param {string} message_or_data
 * @param {Data} data
 * @returns {Promise<APIResponseWithData<{ message: string; data: Data }>>}
 */

/**
 * @template {Dict} Data
 * Respond with status code and data (auto-message).
 * @param {import('types').ApiHttpCode} status_code
 * @param {Data} message_or_data
 * @returns {Promise<APIResponseWithData<{ message: string; data: Data }>>}
 */

/**
 * @template {Dict} Data
 * @param {import("types").ApiHttpCode} status_code
 * @param {string | Data} [message_or_data]
 * @param {Data} [data]
 * @returns {Promise<APIResponseWithData<any> | APIResponseWithoutData>}
 */
async function respond(status_code, message_or_data, data) {
	if (status_code === NO_CONTENT) return new Response(null, { status: NO_CONTENT });

	if (message_or_data !== undefined) {
		if (typeof message_or_data === "string") {
			if (data) {
				return build_response(status_code, message_or_data, data);
			} else {
				return build_response(status_code, message_or_data);
			}
		} else {
			return build_response(status_code, DEFAULT_MESSAGES[status_code], message_or_data);
		}
	} else {
		return build_response(status_code, DEFAULT_MESSAGES[status_code]);
	}
}

/**
 *
 * @template {Dict} Data
 * @param {import("types").ApiHttpCode} status_code
 * @param {string} message
 * @param {Data} [data]
 * @returns {Response}
 */
function build_response(status_code, message, data) {
	const body = { message: message };
	// @ts-ignore
	if (data) body["data"] = data;

	return new Response(JSON.stringify(body), { status: status_code, headers: { "Content-Type": "application/json" } });
}

export { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, NO_CONTENT, OK, SEE_OTHER, SERVER_ERROR, UNAUTHORIZED, api_fetch, respond };
//# sourceMappingURL=index.js.map
