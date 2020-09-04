"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tags = void 0;

require("source-map-support/register");

var _path = require("path");

var _shelljs = require("shelljs");

var _lib = require("../lib");

let cfg = _lib.AppConfig.getInstance();

class Tags {
  static filterFlags() {
    let allowed = cfg.options.tags.styles[cfg.options.tags.style];
    if (allowed == undefined) log.error(`Style ${cfg.options.tags.style} for tags doesn't exist`);
    let tstAllow = new RegExp("\\b(" + allowed.join("|") + ")\\b", "i");
    let tstIgnore = new RegExp("^(" + cfg.options.tags.ignore.join("|") + ")\\b", "i");

    let projectTags = _lib.FileUtils.readFile((0, _path.join)(cfg.dirProject, "tags"));

    let lines = projectTags.split("\n");
    let fileTags = [];

    for (let i = 0; i < lines.length; i++) {
      if (!tstAllow.test(lines[i])) continue;
      if (lines[i].startsWith("$")) continue;
      if (cfg.options.tags.ignore.length > 0 && tstIgnore.test(lines[i])) continue;
      fileTags.push(lines[i]);
    }

    return fileTags.join("\n");
  }

  static forProject(dir) {
    if (!cfg.options.tags.active) return;

    if (cfg.options.tags.generator == "exuberant") {
      (0, _shelljs.exec)(`cd ${cfg.dirProject}; ctags-exuberant --fields=nksSaf --file-scope=yes --sort=no  -R ./${dir}`, {
        async: false
      });

      _lib.FileUtils.writeFile(cfg.dirProject, "tags", Tags.filterFlags(), true);
    }
  }

  static forFile(file) {
    if (!cfg.options.tags.active) return;

    let projectTags = _lib.FileUtils.readFile((0, _path.join)(cfg.dirProject, "tags"));

    let lines = projectTags.split("\n");
    let fileTags = [];
    let testStr = "./" + file;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(testStr)) fileTags.push(lines[i]);
    }

    _lib.FileUtils.writeFile(cfg.dirProject, (0, _path.join)(".tags", file), fileTags.join("\n"), false);
  }

}

exports.Tags = Tags;
//# sourceMappingURL=tags.js.map