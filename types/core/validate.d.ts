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
export function validate<Schema extends import("zod").AnyZodObject>(request: Request, schema: Schema): Promise<Valid<Schema> | Invalid<Schema>>;
/**
 * <Payload>
 */
export type Valid<Payload extends import("zod").AnyZodObject> = {
    success: true;
    payload: import("zod").infer<Payload>;
    error: undefined;
};
/**
 * <Payload>
 */
export type Invalid<Payload extends import("zod").AnyZodObject> = {
    success: false;
    payload: undefined;
    error: import("zod").ZodError<import("zod").infer<Payload>>;
};
