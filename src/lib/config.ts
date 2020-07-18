import { homedir, platform, tmpdir } from "os";
import { join, normalize, sep } from "path";
import { cp } from "shelljs";
import { test } from "shelljs";
import { DefaultConfig } from "../default-config";
import { Logger } from "./log";
import { createDirTree } from "./dirs";
import { FileUtils } from "./files";
import { ObjectUtils } from "./object";

/**
 * Configuration mechanism.
 * <br>Default settings are supposed to be in src/default-config.js
 * <br>Project setttings override and are in working directory config.json
 */

/**
 * @class containing configuration settings
 * @property dirHome - Home directory of computer
 * @property dirMain - Directory of cookware-headless-ice
 * @property dirProject - Directory of current project
 * @property isProject - True if working on a project, false if on cookware-headless-ice
 * @property options - Loaded from config.json in project directory
 */
export class AppConfig {
	dirHome: string;
	dirMain: string;
	dirProject: string;
	dirTemp: string;
	isProject: boolean;
	options: any;
	static instance: AppConfig | null = null;

	/**
	 * Initializes properties based on file system, reads config.json and modifies search path
	 * @param name of project
	 */
	constructor(name: string) {
		this.dirHome = homedir();
		this.dirTemp = join(tmpdir(), name); // or via package shelljs.tempdir()
		FileUtils.mkdir(this.dirTemp);

		this.dirProject = normalize(process.cwd());
		this.dirMain = normalize(__dirname);
		this.dirMain = AppConfig.getProjectDir(this.dirMain);

		// Special case for testing
		if (process.env.NODE_ENV == "test") {
			this.isProject = false;
			this.dirProject = this.dirMain;
		} else {
			this.isProject = this.dirProject != this.dirMain;
		}

		this.read();

		// Add some paths to NODE_PATH
		let dir = join(this.dirProject, "node_modules");
		let paths = [
			join(this.dirMain, "node_modules")
		];
		let sep = platform() == "win32" ? ";" : ":";
		if (this.isProject && test("-d", dir)) {
			paths.push(dir);
		}
		if (this.options.env.node_path && this.options.env.node_path.length > 0) {
			paths = paths.concat(this.options.env.node_path);
		}
		process.env.NODE_PATH = paths.join(sep);
		require("module").Module._initPaths();
	}

	/**
	 * Override default settings. Object.clone() and mergeWith (loadash) don't do this properly
	 *
	 * @param additional path to config settings to merge into already loaded config
	 */
	private mergeInto(additional: string): void {
		let options: any = FileUtils.readJsonFile(additional, false);
		if (!options || Object.keys(options).length == 0) {
			process.exit(-1);
			return;
		}

		// console.log("\n\nCurrent ", this.options);
		// console.log("\n\nAdditional ", additional, options);

		if (this.options.version != options.version) {
			console.warn(
				`Check and correct your project configuration and documentation about it:\n${join(
					this.dirMain,
					"config.json"
				)} \n\nDefault settings and project settings aren't the same version\n`
			);
		}

		ObjectUtils.mergeDeep(this.options, options);
	}

	static getProjectDir(dir: string): string {
		while (dir.length > 2 && !test("-f", join(dir, "config.json"))) {
			dir = normalize(join(dir, ".."));
		}
		return dir;
	}

	/**
	 * Singleton factory to get instance
	 * @param name of project
	 * @param dirProject set to true in case of call from project middleware.js
	 */
	static getInstance(name: string = "", dirProject: string = ""): AppConfig {
		if (!AppConfig.instance) {
			if (!name) console.log(new Error("AppConfig initialized without project name"));

			let dirMain = normalize(process.cwd());
			if (dirProject) {
				dirProject = AppConfig.getProjectDir(dirProject);
				process.chdir(dirProject);
			}

			AppConfig.instance = new AppConfig(name);

			if (dirProject) {
				process.chdir(dirMain);
			}
		}

		return AppConfig.instance;
	}

	/**
	 * Read src/default-config.js and then project config.json
	 */
	read(): void {
		this.options = Object.assign({}, DefaultConfig);

		if (process.env.isNew != undefined) {
			// // Hack for new project, to prevent passing a var through the call stack
			return this.options;
		}

		let settings = join(this.dirProject, "config.json");
		if (!test("-f", settings)) {
			console.error(`Project settings ${settings} not found`);
			process.exit(-1);
		}
		this.mergeInto(settings);
	}

	/**
	* Log overridden config settings to console
	*/
	static showConfig(options: any = null): void {
		const diff = require("deep-diff").diff;
		let cfg = AppConfig.getInstance();
		let log = Logger.getInstance();
		let checkProjects = options ? false : true;

		if (!options) options = Object.assign({}, DefaultConfig);
		let project: any = FileUtils.readJsonFile(join(cfg.dirProject, "config.json"), false);
		let changes = diff(options, project);

		let cols = [
			10,
			50,
			50,
			50
		];
		let line = "".padEnd(cols[0] + cols[1] + cols[2] + cols[3], "-");

		console.log(line);
		console.log("Default configuration settings:");
		console.log(line);
		console.log(ObjectUtils.toString(options, false));
		console.log("");

		console.log(line);
		console.log("Project configuration changes, overrides of default settings:");
		let output = "Kind".padEnd(cols[0], " ");
		output += "Path".padEnd(cols[1], " ");
		output += "Application".padEnd(cols[2], " ");
		output += "Project".padEnd(cols[3], " ");
		console.log(output);
		console.log(line);
		output = "";

		let paths: string[] = [];

		Object.values(changes).forEach((value: any) => {
			let isArrayChange = false;
			let path = value.path.join("/");
			if (paths.includes(path)) {
				return;
			} else {
				paths.push(path);
			}
			let present = value.kind;
			if (present == "D") return;
			switch (present) {
				case "N":
					present = "Added";
					break;
				case "A":
					isArrayChange = true;
				case "E":
					present = "Edited";
					break;
			}

			output += present.padEnd(cols[0], " ");
			output += path.padEnd(cols[1], " ");

			function convert(value: any) {
				let retVal = value;
				if (value == undefined) {
					retVal = "";
				} else if (typeof value == "object" || Array.isArray(value)) {
					retVal = "\n" + JSON.stringify(value, null, 2);
				}
				return String(retVal);
			}

			if (isArrayChange) {
				// output += convert(value.with);
				output += "\n"; // Don't show nature of change. Would distort layout
			} else {
				output += convert(value.lhs).padEnd(cols[2], " ");
				output += convert(value.rhs).padEnd(cols[3], " ") + "\n";
			}
		});

		console.log(output);

		if (!checkProjects) return;

		// Check validity of config.json structure in all known projects
		// While doing that, check version number
		let projects: string[] = cfg.options.projects;
		let saydHello = false;
		projects.forEach((project) => {
			let opts: any = FileUtils.readJsonFile(project, true);
			if (opts.version != undefined && opts.version != options.version) {
				if (!saydHello) {
					log.info(`Checking project config(s).Should be version ${options.version}`);
					saydHello = true;
				}
				log.warn(`- Version number ${opts.version} in ${project}`);
			}
		});
		if (saydHello) {
			log.info("... done");
		}
	}

	/**
	 * Initialize new project
	 */
	static initNewProject(): void {
		process.env.isNew = "true"; // Hack to prevent passing a var through the call stack
		let cfg = AppConfig.getInstance("cookware-headless-ice");
		let dir = join(cfg.dirMain, "default-project");

		if (!test("-d", dir)) {
			console.error(`Couldn't find directory ${dir}`);
			return;
		}

		console.log("Initializing new project directory");

		cp("-fr", join(dir, sep, "*"), join(cfg.dirProject, sep));
		cfg.read();

		let log = Logger.getInstance(cfg.options.logging);
		process.on("uncaughtException", (err) => {
			if (!log.isShuttingDown) {
				console.log(Logger.error2string(err));
			}
		});
		createDirTree(cfg.dirProject, cfg.options.newProject.dirStructure, true);

		console.log("... done");
	}
}

/**
 * Function to display overridden config settings
 * @deprecated and commented away for future reference
 */

/*
export function checkConfig() {
	let cfg = AppConfig.getInstance();
	let log = Logger.getInstance();

	import { addedDiff, updatedDiff } from "deep-object-diff";

	let app = FileUtils.readJsonFile(join(cfg.dirMain, "config.json"), false);
	let project = FileUtils.readJsonFile(join(cfg.dirProject, "config.json"), false);

	// @todo Doesn't display deep overrides like in cfg.options.dependencies.jsdoc.source.include
	log.info("Overridden config settings:", updatedDiff(app, project));

	let added: object = addedDiff(app, project);
	if (Object.keys(added).length > 0) {
		log.info("Added config settings:", added);
	}
}

/**
 * For list of available options
 */
interface Option {
	alias: string;
	name: string;
	type: any;
	description: string;
	module?: string;
	typeLabel?: string;
}

export class AppMenu {
	static instance: AppMenu | null = null;

	checkOverridesShortcutC = {
		alias: "c",
		name: "config",
		type: Boolean,
		description: "Check your project config.json; default and overridden settings"
	};

	initializeNewProjectShortcutI = {
		alias: "i",
		name: "init",
		type: Boolean,
		description: "Initalize new project in current working directory"
	};

	playgroundShortcutY = {
		alias: "y",
		name: "playground",
		type: Boolean,
		description:
			"For developement purposes: Play with functionality. Shortcut y for Y-incison during autopsy (from Greek for 'seeing with your own eyes') 😀"
	};

	helpShortcutH = {
		alias: "h",
		name: "help",
		type: Boolean,
		description: "Display this usage guide."
	};

	options: Option[] = [];

	/**
	 * Singleton factory to get instance
	 * @param name of project
	 */
	static getInstance(): AppMenu {
		if (!AppMenu.instance) {
			AppMenu.instance = new AppMenu();
		}

		return AppMenu.instance;
	}

	getUserChoice(): any {
		// For programming purposes: Check for options with the same shortcut or name
		for (let current = 0; current < this.options.length; current++) {
			if (process.env.NODE_ENV == "production") break;
			for (let toCheck = 0; toCheck < this.options.length; toCheck++) {
				if (toCheck <= current) continue;
				if (this.options[toCheck].alias && this.options[current].alias == this.options[toCheck].alias) {
					console.log(
						`- Double shortcut ${this.options[toCheck].alias} in modules ${this.options[current].module} and ${this.options[
							toCheck
						].module}`
					);
					delete this.options[toCheck].alias;
				}
				if (this.options[current].name == this.options[toCheck].name) {
					console.log(
						`- Double name ${this.options[toCheck].name} in modules ${this.options[current].module} and ${this.options[
							toCheck
						].module}`
					);
				}
			}
		}

		const commandLineArgs = require("command-line-args");
		let chosen = {};
		try {
			chosen = commandLineArgs(this.options);
		} catch (error) {
			// Do nothing
		}
		return chosen;
	}

	showHelp(opts: any) {
		const commandLineUsage = require("command-line-usage");
		const usage = commandLineUsage(opts);
		console.log(usage);
	}

	addOption(opt: Option) {
		if (!opt.module) opt.module = "main";
		this.options.push(opt);
	}
}
