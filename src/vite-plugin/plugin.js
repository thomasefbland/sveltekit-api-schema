// NOTE: This is massive dependency, look into alternatives?
import { globSync } from "fast-glob";
import ts from "typescript";
import path from "node:path";
import { writeFile } from "node:fs/promises";

/**
 * @typedef {{ route: string; method: import('types').Method; payload_type_string?: string; response_type_string: string }} EndpointDefinition
 */

/** @type {Set<import('types').Method>} */
const METHODS = new Set(["GET", "POST"]);
/**
 * File paths to endpoint definitions
 * @type {Map<string, Array<EndpointDefinition>>}
 */
const route_endpoint_definitions = new Map();
/** @type {string} */
let project_path;
/** @type {string} */
let api_base_dir;
/** @type {RegExp} */
let endpoint_path_regex;
/** @type {ts.ParsedCommandLine} */
let config;
/** @type {ts.CompilerHost} */
let host;
/** @type {ts.Program} */
let program;

export { plugin as sveltekit_api_schema };

/**
 * @param {string[]} api_dirs
 * @param {string} [routes_dir]
 * @returns {import('vite').Plugin}
 */
function plugin(api_dirs, routes_dir = "src/routes") {
	return {
		name: "vite-plugin-sveltekit-api-schema",

		configureServer(server) {
			project_path = server.config.root;

			api_base_dir = `${project_path}/${routes_dir}`;

			const resolved_dirs = globSync(api_dirs, {
				cwd: routes_dir,
				onlyDirectories: true,
				unique: true,
			});

			const escaped_dirs = resolved_dirs.map((dir) => dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
			const pattern = `^(?:${project_path}/)?${routes_dir}/(?:${escaped_dirs.join("|")})(/.*)?/\\+server\\.ts$`;
			endpoint_path_regex = RegExp(pattern);

			const config_path = ts.findConfigFile(project_path, ts.sys.fileExists, "tsconfig.json");
			if (!config_path) {
				throw new Error("Could not find a valid 'tsconfig.json'.");
			}

			config = ts.parseJsonConfigFileContent(
				ts.readConfigFile(config_path, ts.sys.readFile).config,
				ts.sys,
				project_path,
				{
					noEmit: true,
					checkJs: false,
					skipLibCheck: true,
					incremental: true,
					tsBuildInfoFile: path.join(project_path, "tsbuildinfo"),
				},
				config_path
			);
			host = ts.createCompilerHost(config.options);
			program = ts.createProgram({
				rootNames: config.fileNames,
				options: config.options,
				host: host,
			});

			for (const dir of escaped_dirs) {
				const full_path = path.join(path.resolve(api_base_dir, dir), "**/*");
				server.watcher.add(full_path);
			}

			server.watcher.on("unlink", (file_path) => {
				if (endpoint_path_regex.test(file_path)) {
					route_endpoint_definitions.delete(file_path);
					queue_files([file_path]);
				}
			});
			server.watcher.on("add", (file_path) => {
				if (endpoint_path_regex.test(file_path)) {
					queue_files([file_path]);
				}
			});

			queue_files(
				program
					.getSourceFiles()
					.map((source_file) => source_file.fileName)
					.filter((file_path) => endpoint_path_regex.test(file_path))
			);
		},

		handleHotUpdate(ctx) {
			if (endpoint_path_regex.test(ctx.file)) queue_files([ctx.file]);
		},
	};
}

/** @type {Set<string>} */
let queued_files = new Set();
/** @type {ReturnType<typeof setTimeout> | null} */
let timeout_id = null;
/**
 *
 * @param {Array<string>} file_paths
 */
function queue_files(file_paths) {
	for (const file_path of file_paths) {
		queued_files.add(file_path);
	}
	if (timeout_id) clearTimeout(timeout_id);
	timeout_id = setTimeout(() => {
		program = ts.createProgram({
			rootNames: config.fileNames,
			options: config.options,
			oldProgram: program,
			host: host,
		});
		const type_checker = program.getTypeChecker();
		for (const file_path of queued_files) {
			const source_file = program.getSourceFile(file_path);
			if (!!!source_file) continue;
			parseFile(source_file, type_checker);
		}
		write_endpoints_file();
		queued_files.clear();
		timeout_id = null;
	}, 300);
}

/**
 *
 * @param {ts.SourceFile} source_file
 * @param {ts.TypeChecker} type_checker
 */
function parseFile(source_file, type_checker) {
	/** @type {Array<EndpointDefinition>} */
	const endpoint_definitions = [];
	source_file.forEachChild((node) => {
		if (ts.isFunctionDeclaration(node) && node.name && METHODS.has(/** @type {import('types').Method} */ (node.name.text))) {
			if (node.body) {
				/** @type {string | null} */
				let payload_type_string = null;
				/** @type {string | null} */
				let response_type_string = null;

				if (node.name.text === "GET") payload_type_string = "";

				/**
				 *
				 * @param {ts.Statement} statement
				 */
				function traverseStatements(statement) {
					if (ts.isReturnStatement(statement)) {
						if (statement.expression) {
							let return_type = type_checker.getTypeAtLocation(statement.expression);
							return_type = type_checker.getAwaitedType(return_type) ?? return_type;
							const return_type_string = type_checker.typeToString(
								return_type,
								undefined,
								ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteTypeArgumentsOfSignature | ts.TypeFormatFlags.UseFullyQualifiedType
							);
							// TODO: Redo this so that it exports multiple kinds of responses to support more complex endpoints
							// Likely needs some sort of version discriminant added to response
							/**
							 * Prioritizes the last return type that has data.
							 * This means if an endpoint can return without
							 * data due to an error earlier in the function,
							 * say during input validation, the appropriate
							 * return type can still be resolved. Example:
							 * ---------------------------------------------
							 * const parse_result = schema.safeParse(payload);
							 * if (false === parse_result.success) return respond(400);
							 * ....
							 * return respond(200, "Successful endpoint call", data);
							 * ---------------------------------------------
							 * By prioritizing the last return of type
							 * `APIResponseWithData`, we ensure the client
							 * can always infer the appropriate type by
							 * checking the response's `ok` value.
							 */
							if (null === response_type_string && return_type_string.startsWith("APIResponseWithout")) {
								response_type_string = "{ message: string; }";
							} else if (return_type_string.startsWith("APIResponseWithData")) {
								response_type_string = return_type_string.substring(return_type_string.indexOf("APIResponseWithData<") + 20, return_type_string.indexOf(">"));
							}
						}
					} else if (ts.isBlock(statement)) {
						statement.statements.forEach(traverseStatements);
					} else if (ts.isIfStatement(statement)) {
						traverseStatements(statement.thenStatement);
						if (statement.elseStatement) traverseStatements(statement.elseStatement);
					} else if (ts.isTryStatement(statement)) {
						traverseStatements(statement.tryBlock);
						if (statement.catchClause) traverseStatements(statement.catchClause.block);
						if (statement.finallyBlock) traverseStatements(statement.finallyBlock);
					} else if (null === payload_type_string && ts.isVariableStatement(statement)) {
						for (const declaration of statement.declarationList.declarations) {
							if (
								(ts.isObjectBindingPattern(declaration.name) || (ts.isIdentifier(declaration.name) && declaration.name.text === "payload")) &&
								declaration.initializer &&
								ts.isAwaitExpression(declaration.initializer) &&
								ts.isCallExpression(declaration.initializer.expression)
							) {
								const call_expression = declaration.initializer.expression;
								if (ts.isIdentifier(call_expression.expression) && call_expression.expression.text === "validate") {
									const schema_arg = call_expression.arguments[1];
									if (schema_arg) {
										const schema_type = type_checker.getTypeAtLocation(schema_arg);
										payload_type_string = convert_zod_type_to_string(schema_type, type_checker);
										if (payload_type_string) break;
									}
								}
							}
						}
					}
				}

				for (const statement of node.body.statements) {
					traverseStatements(statement);
				}

				if (response_type_string) {
					/** @type {EndpointDefinition} */
					const endpoint = {
						route: resolve_route(source_file.fileName),
						method: /** @type {import('types').Method} */ (node.name.text),
						response_type_string: response_type_string,
					};
					if (node.name.text !== "GET" && payload_type_string) {
						endpoint.payload_type_string = payload_type_string;
					}
					endpoint_definitions.push(endpoint);
				}
			}
		}
	});
	if (endpoint_definitions.length > 0) {
		route_endpoint_definitions.set(source_file.fileName, endpoint_definitions);
	} else {
		route_endpoint_definitions.delete(source_file.fileName);
	}
}

/**
 *
 * @param {ts.Type} type
 * @param {ts.TypeChecker} type_checker
 * @returns {string | null}
 */
function convert_zod_type_to_string(type, type_checker) {
	const zod_type = type.getBaseTypes()?.[0];
	if (zod_type) {
		const zod_args = type_checker.getTypeArguments(/** @type {ts.TypeReference} */ (zod_type))[2];
		return zod_args
			? type_checker.typeToString(
					zod_args,
					undefined,
					ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteTypeArgumentsOfSignature | ts.TypeFormatFlags.UseFullyQualifiedType
			  )
			: null;
	}

	const zod_args = type_checker.getTypeArguments(/** @type {ts.TypeReference} */ (type));
	if (zod_args.length === 5) {
		return zod_args[4]
			? type_checker.typeToString(
					zod_args[4],
					undefined,
					ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteTypeArgumentsOfSignature | ts.TypeFormatFlags.UseFullyQualifiedType
			  )
			: null;
	} else if (zod_args.length === 2) {
		return zod_args[0] ? `Array<${convert_zod_type_to_string(zod_args[0], type_checker)}>` : null;
	}

	return zod_args[0] ? convert_zod_type_to_string(zod_args[0], type_checker) : null;
}

/**
 *
 * @param {string} file_path
 * @returns {string}
 */
function resolve_route(file_path) {
	const relative_path = path.relative(api_base_dir, file_path);
	let clean_path = relative_path.replace(path.extname(relative_path), "");
	clean_path = clean_path.replace("+server", "");
	clean_path = clean_path.replace(/\/$/, "");
	clean_path = clean_path.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
	if (clean_path.startsWith("apps")) clean_path = clean_path.replace("api/", "").replace("apps", "api");
	return clean_path;
}

async function write_endpoints_file() {
	let definitions = "";
	for (const endpoint_definitions of route_endpoint_definitions.values()) {
		definitions += `\t/* ${endpoint_definitions[0].route} */\n`;
		for (const endpoint_definition of endpoint_definitions) {
			definitions += `\texport function api_fetch(${build_fetch_params(endpoint_definition)}): Promise<UnwrappedResponse<${endpoint_definition.response_type_string}>>;\n`;
		}
		definitions += "\n";
	}
	const content = `import { type UnwrappedResponse, type SvelteFetch } from 'vite-plugin-sveltekit-api-schema';

declare module 'vite-plugin-sveltekit-api-schema' {
${definitions}
export { api_fetch as fetch };
}
`;
	await writeFile(path.resolve(project_path, "src/api.d.ts"), content);
}

/**
 *
 * @param {EndpointDefinition} args
 * @returns {string}
 */
function build_fetch_params({ route, method, payload_type_string }) {
	const options_string = payload_type_string ? `payload: ${payload_type_string}, fetch?: SvelteFetch` : "fetch?: SvelteFetch";
	return `route: "/${route}", method: "${method}", ${options_string}`;
}
