/**
 * @template {import('zod').AnyZodObject} Payload
 * @typedef {{ success: true; payload: import('zod').infer<Payload>; error: undefined }} Valid
 */

import { ZodError } from "zod";

/**
 * @template {import('zod').AnyZodObject} Payload
 * @typedef {{ success: false; payload: undefined; error: import('zod').ZodError<import('zod').infer<Payload>> }} Invalid
 */

/**
 *
 * @template {import('zod').AnyZodObject} Schema
 * @param {Request} request
 * @param {Schema} schema
 * @returns {Promise<Valid<Schema> | Invalid<Schema>>}
 */
export async function validate(request, schema) {
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
		/** @type {import('zod').ZodError<import('zod').infer<Schema>>} */
		const error = new ZodError([
			{
				code: "custom",
				message: "Invalid JSON in request body",
				path: [],
			},
		]);

		return {
			success: false,
			payload: undefined,
			error,
		};
	}
}
