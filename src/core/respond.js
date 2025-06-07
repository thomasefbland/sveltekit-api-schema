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
async function respond(status_code, message_or_data, data) {
    if (message_or_data) {
        if (typeof message_or_data === "string") {
            if (data) {
                return buildResponse(status_code, message_or_data, data);
            }
            else {
                return buildResponse(status_code, message_or_data);
            }
        }
        else {
            return buildResponse(status_code, DEFAULT_MESSAGES[status_code], message_or_data);
        }
    }
    else {
        return buildResponse(status_code, DEFAULT_MESSAGES[status_code]);
    }
}
function buildResponse(status_code, message, data) {
    const body = { message: message };
    // @ts-ignore
    if (data)
        body["data"] = data;
    if (status_code === 204)
        return new Response(null, { status: status_code });
    return new Response(JSON.stringify(body), { status: status_code, headers: { "Content-Type": "application/json" } });
}
export { respond };
