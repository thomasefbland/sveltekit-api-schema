type ApiHttpCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;
interface SuccessfulAPIResponse<JSON extends Record<string, any>> extends Response {
    ok: true;
    json(): Promise<JSON>;
}
interface FailedAPIResponse extends Response {
    ok: false;
}
type APIResponseWithoutData = SuccessfulAPIResponse<{
    message: string;
}> | FailedAPIResponse;
type APIResponseWithData<JSON extends Record<string, any>> = SuccessfulAPIResponse<JSON> | FailedAPIResponse;
declare function respond(status_code: ApiHttpCode): Promise<APIResponseWithoutData>;
declare function respond(status_code: ApiHttpCode, message_or_data: string): Promise<APIResponseWithoutData>;
declare function respond<Data extends Record<string, any>>(status_code: ApiHttpCode, message_or_data: string, data: Data): Promise<APIResponseWithData<{
    message: string;
    data: Data;
}>>;
declare function respond<Data extends Record<string, any>>(status_code: ApiHttpCode, message_or_data: Data): Promise<APIResponseWithData<{
    message: string;
    data: Data;
}>>;
export { respond };
