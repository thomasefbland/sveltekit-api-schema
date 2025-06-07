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

function $constructor(name, initializer, params) {
    function init(inst, def) {
        var _a;
        Object.defineProperty(inst, "_zod", {
            value: inst._zod ?? {},
            enumerable: false,
        });
        (_a = inst._zod).traits ?? (_a.traits = new Set());
        inst._zod.traits.add(name);
        initializer(inst, def);
        // support prototype modifications
        for (const k in _.prototype) {
            if (!(k in inst))
                Object.defineProperty(inst, k, { value: _.prototype[k].bind(inst) });
        }
        inst._zod.constr = _;
        inst._zod.def = def;
    }
    // doesn't work if Parent has a constructor with arguments
    const Parent = params?.Parent ?? Object;
    class Definition extends Parent {
    }
    Object.defineProperty(Definition, "name", { value: name });
    function _(def) {
        var _a;
        const inst = params?.Parent ? new Definition() : this;
        init(inst, def);
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        for (const fn of inst._zod.deferred) {
            fn();
        }
        return inst;
    }
    Object.defineProperty(_, "init", { value: init });
    Object.defineProperty(_, Symbol.hasInstance, {
        value: (inst) => {
            if (params?.Parent && inst instanceof params.Parent)
                return true;
            return inst?._zod?.traits?.has(name);
        },
    });
    Object.defineProperty(_, "name", { value: name });
    return _;
}

// functions
function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
        return value.toString();
    return value;
}

const initializer$1 = (inst, def) => {
    inst.name = "$ZodError";
    Object.defineProperty(inst, "_zod", {
        value: inst._zod,
        enumerable: false,
    });
    Object.defineProperty(inst, "issues", {
        value: def,
        enumerable: false,
    });
    Object.defineProperty(inst, "message", {
        get() {
            return JSON.stringify(def, jsonStringifyReplacer, 2);
        },
        enumerable: true,
        // configurable: false,
    });
};
const $ZodError = $constructor("$ZodError", initializer$1);
function flattenError(error, mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of error.issues) {
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
function formatError(error, _mapper) {
    const mapper = _mapper ||
        function (issue) {
            return issue.message;
        };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
        for (const issue of error.issues) {
            if (issue.code === "invalid_union" && issue.errors.length) {
                issue.errors.map((issues) => processError({ issues }));
            }
            else if (issue.code === "invalid_key") {
                processError({ issues: issue.issues });
            }
            else if (issue.code === "invalid_element") {
                processError({ issues: issue.issues });
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
    processError(error);
    return fieldErrors;
}

const initializer = (inst, issues) => {
    $ZodError.init(inst, issues);
    inst.name = "ZodError";
    Object.defineProperties(inst, {
        format: {
            value: (mapper) => formatError(inst, mapper),
            // enumerable: false,
        },
        flatten: {
            value: (mapper) => flattenError(inst, mapper),
            // enumerable: false,
        },
        addIssue: {
            value: (issue) => inst.issues.push(issue),
            // enumerable: false,
        },
        addIssues: {
            value: (issues) => inst.issues.push(...issues),
            // enumerable: false,
        },
        isEmpty: {
            get() {
                return inst.issues.length === 0;
            },
            // enumerable: false,
        },
    });
    // Object.defineProperty(inst, "isEmpty", {
    //   get() {
    //     return inst.issues.length === 0;
    //   },
    // });
};
const ZodError = $constructor("ZodError", initializer);
// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;

/**
 * @template {import('zod/v4').ZodObject} Payload
 * @typedef {{ success: true; payload: import('zod/v4').infer<Payload>; error: undefined }} Valid<Payload>
 */

/**
 * @template {import('zod/v4').ZodObject} Payload
 * @typedef {{ success: false; payload: undefined; error: import('zod/v4').ZodError<import('zod/v4').infer<Payload>> }} Invalid<Payload>
 */

/**
 *
 * @template {import('zod/v4').ZodObject} Schema
 * @param {Request} request
 * @param {Schema} schema
 * @returns {Promise<Valid<Schema> | Invalid<Schema>>}
 */
async function validate(request, schema) {
	try {
		const json = await request.json();
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
		const error = /** @type {import('zod/v4').ZodError<import('zod/v4').output<Schema>>} */ (
			new ZodError([
				{
					code: "custom",
					input: undefined,
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

export { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, NO_CONTENT, OK, SEE_OTHER, SERVER_ERROR, UNAUTHORIZED, api_fetch, respond, validate };
//# sourceMappingURL=index.js.map
