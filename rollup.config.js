import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const createConfig = (input, output) => ({
	input,
	output: {
		file: output,
		format: "esm",
		sourcemap: true,
	},
	plugins: [
		nodeResolve({
			mainFields: ["module"],
			extensions: [".mjs", ".js", ".ts"],
			preferBuiltins: false,
		}),
		,
		commonjs(),
	],
	external: ["node:fs/promises", "node:path", "fs", "path", "os", "stream", "util", "events", "picocolors", "node-fetch", "typescript", "vite"],
});

export default [createConfig("src/core/index.js", "dist/index.js"), createConfig("src/vite-plugin/index.js", "dist/vite-plugin/index.js")];
