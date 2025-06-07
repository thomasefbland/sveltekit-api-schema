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
export function respond<Data extends Dict>(status_code: ApiHttpCode, message_or_data?: string | Data, data?: Data): Promise<APIResponseWithData<any> | APIResponseWithoutData>;
export type Dict = Record<string, any>;
export type SuccessfulAPIResponse = Response & {
    ok: true;
    json: () => Promise<Dict>;
};
export type FailedAPIResponse = Response & {
    ok: false;
};
export type APIResponseWithoutData = SuccessfulAPIResponse | FailedAPIResponse;
export type APIResponseWithData<T> = (SuccessfulAPIResponse & {
    json(): Promise<T>;
}) | FailedAPIResponse;
export type ApiHttpCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;
