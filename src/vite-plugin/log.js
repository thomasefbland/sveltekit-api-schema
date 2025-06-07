import colors from "picocolors";

/**
 *
 * @param {string} message
 */
export function log(message) {
	const timestamp = new Date().toLocaleTimeString();
	console.log(`${colors.dim(timestamp)} ${colors.cyan(colors.bold("[vite-plugin-sveltekit-api-schema]"))} ${message}`);
}
