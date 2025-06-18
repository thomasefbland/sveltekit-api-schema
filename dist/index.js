const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;

const SEE_OTHER = 303;
const TEMPORARY_REDIRECT = 307;

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;

const SERVER_ERROR = 500;

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
async function api_fetch(options) {
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

var util;
(function (util) {
    util.assertEqual = (_) => { };
    function assertIs(_arg) { }
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj) => {
        const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
            filtered[k] = obj[k];
        }
        return util.objectValues(filtered);
    };
    util.objectValues = (obj) => {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
        ? (obj) => Object.keys(obj) // eslint-disable-line ban/ban
        : (object) => {
            const keys = [];
            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = (arr, checker) => {
        for (const item of arr) {
            if (checker(item))
                return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
        : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array.map((val) => (typeof val === "string" ? `'${val}'` : val)).join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util || (util = {}));
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = (first, second) => {
        return {
            ...first,
            ...second, // second overwrites first
        };
    };
})(objectUtil || (objectUtil = {}));
util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);

util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
]);
class ZodError extends Error {
    get errors() {
        return this.issues;
    }
    constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    format(_mapper) {
        const mapper = _mapper ||
            function (issue) {
                return issue.message;
            };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                }
                else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                }
                else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                }
                else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < issue.path.length) {
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                            // if (typeof el === "string") {
                            //   curr[el] = curr[el] || { _errors: [] };
                            // } else if (typeof el === "number") {
                            //   const errorArray: any = [];
                            //   errorArray._errors = [];
                            //   curr[el] = curr[el] || errorArray;
                            // }
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    static assert(value) {
        if (!(value instanceof ZodError)) {
            throw new Error(`Not a ZodError: ${value}`);
        }
    }
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    get formErrors() {
        return this.flatten();
    }
}
ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
};

/**
 * @template {import('zod').AnyZodObject} Payload
 * @typedef {{ success: true; payload: import('zod').infer<Payload>; error: undefined }} Valid<Payload>
 */

/**
 * @template {import('zod').AnyZodObject} Payload
 * @typedef {{ success: false; payload: undefined; error: import('zod').ZodError<import('zod').infer<Payload>> }} Invalid<Payload>
 */

/**
 *
 * @template {import('zod').AnyZodObject} Schema
 * @param {Request} request
 * @param {Schema} schema
 * @returns {Promise<Valid<Schema> | Invalid<Schema>>}
 */
async function validate(request, schema) {
	const content_type = request.headers.get("content-type") || "";
	try {
		if (content_type.includes("application/json")) {
			var json = await request.json();
		} else {
			const url = new URL(request.url);
			json = Object.fromEntries(url.searchParams.entries());
		}
		const { success, data, error } = schema.safeParse(json);

		if (success) {
			return {
				success,
				payload: data,
				error,
			};
		} else {
			return {
				success,
				payload: data,
				error,
			};
		}
	} catch {
		const error = /** @type {import('zod').ZodError<import('zod').output<Schema>>} */ (
			new ZodError([
				{
					code: "custom",
					message: "Invalid JSON in request body",
					path: [],
				},
			])
		);

		return {
			success: false,
			payload: undefined,
			error,
		};
	}
}

// TODO: Migrate to zod/v4, need to fix the plugin zod type parser though. HARD
// import { ZodError } from "zod/v4";

// /**
//  * @template {import('zod/v4').ZodObject} Payload
//  * @typedef {{ success: true; payload: import('zod/v4').infer<Payload>; error: undefined }} Valid<Payload>
//  */

// /**
//  * @template {import('zod/v4').ZodObject} Payload
//  * @typedef {{ success: false; payload: undefined; error: import('zod/v4').ZodError<import('zod/v4').infer<Payload>> }} Invalid<Payload>
//  */

// /**
//  *
//  * @template {import('zod/v4').ZodObject} Schema
//  * @param {Request} request
//  * @param {Schema} schema
//  * @returns {Promise<Valid<Schema> | Invalid<Schema>>}
//  */
// export async function validate(request, schema) {
// 	try {
// 		const json = await request.json();
// 		const { success, data, error } = schema.safeParse(json);

// 		if (success) {
// 			return {
// 				success,
// 				payload: data,
// 				error,
// 			};
// 		} else {
// 			return {
// 				success,
// 				payload: data,
// 				error,
// 			};
// 		}
// 	} catch {
// 		const error = /** @type {import('zod/v4').ZodError<import('zod/v4').output<Schema>>} */ (
// 			new ZodError([
// 				{
// 					code: "custom",
// 					input: undefined,
// 					message: "Invalid JSON in request body",
// 					path: [],
// 				},
// 			])
// 		);

// 		return {
// 			success: false,
// 			payload: undefined,
// 			error,
// 		};
// 	}
// }

export { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, NO_CONTENT, OK, SEE_OTHER, SERVER_ERROR, TEMPORARY_REDIRECT, UNAUTHORIZED, api_fetch, respond, validate };
//# sourceMappingURL=index.js.map
