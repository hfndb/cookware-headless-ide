import { join } from "path";
import { AppConfig, FileUtils, FileStatus, Logger } from "../lib";
import { Beautify } from "../lib/beautify";

let cfg = AppConfig.getInstance();
let log = Logger.getInstance(cfg.options.logging);

export class PhpUtils {
	/**
	 * Beautify a .scss file. Read from disk and write
	 * @returns {boolean} if any transcompiling error on the way
	 */
	static beautify(entry: FileStatus): boolean {
		let toReturn = true;
		if (cfg.options.server.beautify.includes("php")) {
			let fullPath = join(entry.dir, entry.source);
			let source = FileUtils.readFile(fullPath);
			source = Beautify.content(entry.source, source);
			if (source) {
				FileUtils.writeFile(entry.dir, entry.source, source, false);
			} else {
				toReturn = false;
			}
		}
		return toReturn;
	}
}
