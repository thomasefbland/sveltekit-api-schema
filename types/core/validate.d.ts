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
export function validate<Schema extends import("zod/v4").ZodObject>(request: Request, schema: Schema): Promise<Valid<Schema> | Invalid<Schema>>;
/**
 * <Payload>
 */
export type Valid<Payload extends import("zod/v4").ZodObject> = {
    success: true;
    payload: import("zod/v4").infer<Payload>;
    error: undefined;
};
/**
 * <Payload>
 */
export type Invalid<Payload extends import("zod/v4").ZodObject> = {
    success: false;
    payload: undefined;
    error: import("zod/v4").ZodError<import("zod/v4").infer<Payload>>;
};
