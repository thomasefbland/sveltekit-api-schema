import { ZodError } from "zod";

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
export async function validate(request, schema) {
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
