import { createWriteStream } from "fs";
import { join } from "path";
import { platform } from "os";
import { cd, test } from "shelljs";
import { AppConfig, Logger } from "../lib";

// Usage: create-app.js <project dir> <index app>

cd(process.argv[2]);

let cfg = AppConfig.getInstance("cookware-headless-ice");
let log = Logger.getInstance(cfg.options.logging);

let idx = Number.parseInt(process.argv[3]);
let bundle = cfg.options.javascript.apps[idx];
let outDir = join(cfg.dirProject, cfg.options.javascript.dirs.output);
let src = join(outDir, bundle.source);
let outfile = join(outDir, bundle.output);
let browserify = require("browserify");

// Add some paths to NODE_PATH
let dir = join(cfg.dirProject, "node_modules");
let paths = [
	join(cfg.dirMain, "node_modules")
];
let sep = platform() == "win32" ? ";" : ":";
if (cfg.isProject && test("-d", dir)) {
	paths.push(cfg.dirProject);
	paths.push(dir);
}
if (cfg.options.env.node_path && cfg.options.env.node_path.length > 0) {
	paths = paths.concat(cfg.options.env.node_path);
}
process.env.NODE_PATH = paths.join(sep);
require("module").Module._initPaths();

/*
	unassertify - Remove assert() calls
	envify - Replace environment variables—by default, replaces NODE_ENV with "production"
	uglifyify - Remove dead code from modules
	common-shakeify - Remove unused exports from modules
	browser-pack-flat - Output a "flat" bundle, with all modules in a single scope
	bundle-collapser - When using the --no-flat option, bundle-collapser replaces file paths in require() calls with short module IDs
 */

if (cfg.options.javascript.compress) {
	// For production use
	browserify(src)
		.transform("unassertify", { global: true })
		.transform("envify", { global: true })
		.transform("uglifyify", { global: true })
		.plugin("common-shakeify")
		.plugin("browser-pack-flat/plugin")
		.bundle()
		.pipe(
			createWriteStream(outfile, {
				encoding: "utf8"
			})
		);
} else {
	// For dev purposes
	browserify(src).bundle().pipe(
		createWriteStream(outfile, {
			encoding: "utf8"
		})
	);
}

log.info(`- Written Javascript app ${bundle.output} (${cfg.options.javascript.compress ? "compressed" : "plain"}) `);
