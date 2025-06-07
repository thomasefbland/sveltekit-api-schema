type ApiHttpCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;
const DEFAULT_MESSAGES: Record<ApiHttpCode, string> = {
	200: "OK",
	201: "Created",
	204: "No Content",
	400: "Bad Request",
	401: "Unauthorized",
	403: "Forbidden",
	404: "Not Found",
	500: "Internal Server Error",
} as const;

interface SuccessfulAPIResponse<JSON extends Record<string, any>> extends Response {
	ok: true;
	json(): Promise<JSON>;
}
interface FailedAPIResponse extends Response {
	ok: false;
}
type APIResponseWithoutData = SuccessfulAPIResponse<{ message: string }> | FailedAPIResponse;
type APIResponseWithData<JSON extends Record<string, any>> = SuccessfulAPIResponse<JSON> | FailedAPIResponse;

// Message only
async function respond(status_code: ApiHttpCode): Promise<APIResponseWithoutData>;
async function respond(status_code: ApiHttpCode, message_or_data: string): Promise<APIResponseWithoutData>;
// Message and data
async function respond<Data extends Record<string, any>>(
	status_code: ApiHttpCode,
	message_or_data: string,
	data: Data
): Promise<APIResponseWithData<{ message: string; data: Data }>>;
async function respond<Data extends Record<string, any>>(status_code: ApiHttpCode, message_or_data: Data): Promise<APIResponseWithData<{ message: string; data: Data }>>;
async function respond<Data extends Record<string, any>>(status_code: ApiHttpCode, message_or_data?: string | Data, data?: Data) {
	if (message_or_data) {
		if (typeof message_or_data === "string") {
			if (data) {
				return buildResponse(status_code, message_or_data, data);
			} else {
				return buildResponse(status_code, message_or_data);
			}
		} else {
			return buildResponse(status_code, DEFAULT_MESSAGES[status_code], message_or_data);
		}
	} else {
		return buildResponse(status_code, DEFAULT_MESSAGES[status_code]);
	}
}

function buildResponse<Data extends Record<string, any>>(status_code: ApiHttpCode, message: string, data?: Data) {
	const body = { message: message };
	// @ts-ignore
	if (data) body["data"] = data;
	if (status_code === 204) return new Response(null, { status: status_code });
	return new Response(JSON.stringify(body), { status: status_code, headers: { "Content-Type": "application/json" } });
}

export { respond };
