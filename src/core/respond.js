import { NO_CONTENT } from "./HTTP_CODES.js";

/**
 * @typedef {200 | 201 | 204 | 400 | 401 | 403 | 404 | 500} ApiHttpCode
 */

/**
 * @type {Record<ApiHttpCode, string>}
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
 * @param {ApiHttpCode} status_code
 * @returns {Promise<APIResponseWithoutData>}
 */

/**
 * Respond with a status code and message.
 * @param {ApiHttpCode} status_code
 * @param {string} message_or_data
 * @returns {Promise<APIResponseWithoutData>}
 */

/**
 * @template {Dict} Data
 * Respond with status code, message, and data.
 * @param {ApiHttpCode} status_code
 * @param {string} message_or_data
 * @param {Data} data
 * @returns {Promise<APIResponseWithData<{ message: string; data: Data }>>}
 */

/**
 * @template {Dict} Data
 * Respond with status code and data (auto-message).
 * @param {ApiHttpCode} status_code
 * @param {Data} message_or_data
 * @returns {Promise<APIResponseWithData<{ message: string; data: Data }>>}
 */

/**
 * @template {Dict} Data
 * @param {ApiHttpCode} status_code
 * @param {string | Data} [message_or_data]
 * @param {Data} [data]
 * @returns {Promise<APIResponseWithData<any> | APIResponseWithoutData>}
 */
export async function respond(status_code, message_or_data, data) {
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
 * @param {ApiHttpCode} status_code
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
