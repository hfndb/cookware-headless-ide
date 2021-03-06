"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shrinker = exports.stripJs = exports.stripHtml = exports.Stripper = void 0;
const path_1 = require("path");
const utils_1 = require("../lib/utils");
const lib_1 = require("../lib");
class Stripper {
    constructor(after, around, before) {
        this.after = after || [];
        this.around = around || [];
        this.before = before || [];
    }
    stripFile(src) {
        let mlnTemplate = 0;
        let lines = src.split("\n");
        let toReturn = "";
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line)
                continue;
            if (!mlnTemplate && line.includes("multiline template")) {
                mlnTemplate = 1;
                continue;
            }
            else if (mlnTemplate == 1) {
                mlnTemplate = 2;
                continue;
            }
            else if (mlnTemplate == 2) {
                toReturn += line + "\n";
                if (line.includes("`"))
                    mlnTemplate = 0;
                continue;
            }
            line = this.stripLine(line);
            toReturn += line;
        }
        return toReturn;
    }
    stripLine(line) {
        let lastIdx = -1;
        let idx = line.indexOf(" ", lastIdx) + 1;
        while (idx >= 0 && idx > lastIdx) {
            let strPart1 = line.substring(0, idx);
            let strPart2 = line.substring(idx);
            if (!this.isInString(strPart1) && !this.preserveSpace(strPart1, strPart2))
                strPart1 = strPart1.trimRight();
            line = strPart1 + strPart2;
            lastIdx = idx;
            idx = line.indexOf(" ", lastIdx) + 1;
        }
        return line;
    }
    isInString(str) {
        let sq = utils_1.StringExt.occurrences(str, "'");
        let dq = utils_1.StringExt.occurrences(str, '"');
        let cm = utils_1.StringExt.occurrences(str, "/");
        return sq % 2 != 0 || dq % 2 != 0 || cm % 2 != 0;
    }
    preserveSpace(part1, part2) {
        let r = false;
        for (let i = 0; i < this.after.length && !r; i++) {
            if (part1.endsWith(this.after[i] + " "))
                r = true;
        }
        for (let i = 0; i < this.around.length && !r; i++) {
            if (part1.endsWith(this.around[i] + " "))
                r = true;
        }
        return r;
    }
    static stripImports(src) {
        let lines = src.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("import")) {
                lines[i] = "";
            }
            if (lines[i].startsWith("exports.")) {
                lines[i] = "";
            }
            else if (lines[i].startsWith("export ")) {
                lines[i] = lines[i].replace("export ", "");
            }
        }
        return lines.join("\n");
    }
}
exports.Stripper = Stripper;
function stripHtml(source) {
    let cfg = lib_1.AppConfig.getInstance();
    if (!cfg.options.html.stripper.active)
        return source;
    let s = new Stripper();
    return s.stripFile(source);
}
exports.stripHtml = stripHtml;
function stripJs(source) {
    let cfg = lib_1.AppConfig.getInstance();
    let spaces = cfg.options.javascript.lineStripping.needsSpace;
    let s = new Stripper(spaces.after, spaces.around, spaces.before);
    return s.stripFile(source);
}
exports.stripJs = stripJs;
class Shrinker {
    constructor() {
        this.codeZero = "0".charCodeAt(0);
        this.codeNine = "9".charCodeAt(0);
        this.content = "";
        this.alpha = [];
        this.dictTxt = "";
        this.numeric = [];
        this.lastUsed = "";
        for (let ll = 97; ll < 123; ll++) {
            this.alpha.push(String.fromCharCode(ll));
        }
        for (let ll = 65; ll < 91; ll++) {
            this.alpha.push(String.fromCharCode(ll));
        }
        for (let nr = 0; nr < 10; nr++) {
            this.numeric.push(nr.toString());
        }
    }
    getChar(what) {
        let charCode = what.single.charCodeAt(0);
        let isNum = charCode >= this.codeZero && charCode <= this.codeNine;
        if (isNum && what.single == "9") {
            what.single = "a";
            what.overflowed = true;
        }
        else if (isNum) {
            what.single = (parseInt(what.single) + 1).toString();
            what.overflowed = false;
        }
        else if (what.single == "Z") {
            what.single = "0";
            what.overflowed = false;
        }
        else {
            let idx = this.alpha.findIndex(val => val == what.single);
            what.single = this.alpha[idx + 1];
            what.overflowed = false;
        }
    }
    getNext() {
        let toReturn = this.lastUsed;
        if (!toReturn) {
            toReturn = "Aa";
            this.lastUsed = toReturn;
            return toReturn;
        }
        let last = toReturn.split("");
        let lastIdx = last.length - 1;
        let go = {
            single: "",
            overflowed: true
        };
        while (true) {
            go.single = last[lastIdx];
            this.getChar(go);
            if (go.overflowed && lastIdx == 0) {
                let len = toReturn.length;
                toReturn = "A".padEnd(len + 1, "a");
                break;
            }
            else if (go.overflowed) {
                last[lastIdx] = go.single;
                lastIdx -= 1;
            }
            else {
                last[lastIdx] = go.single;
                break;
            }
        }
        toReturn = last.join("");
        this.lastUsed = toReturn;
        return toReturn;
    }
    shorten(search, replace, all = true) {
        if (all) {
            this.content = this.content.replace(new RegExp(search, "g"), replace);
            return;
        }
        let idx = this.content.indexOf(search);
        if (idx < 0)
            return;
        let strPart1 = this.content.substring(0, idx);
        let strPart2 = this.content.substring(idx + search.length);
        this.content = strPart1 + replace + strPart2;
    }
    classes(act) {
        let cR = this.getNext();
        this.dictTxt +=
            `${"".padEnd(30, "-")}\n` +
                `Class: ${act.class}: ${cR}\n` +
                `${"".padEnd(30, "-")}\n`;
        let methods = act.methods;
        for (let i = 0; i < methods.length; i++) {
            let mS = methods[i];
            let mR = this.getNext();
            this.shorten(act.class + "." + mS, cR + "." + mR);
            if (this.content.includes(`var ${act.class}=`)) {
                this.shorten(mS + ":function " + mS, mR + ":function ", false);
            }
            this.shorten(act.class + ".prototype." + mS, cR + ".prototype." + mR);
            this.shorten("this." + mS, "this." + mR);
            this.dictTxt += `- ${mR}: ${mS}\n`;
        }
        this.shorten(act.class, cR);
    }
    functions(act) {
        this.dictTxt += `Functions:\n`;
        for (let i = 0; i < act.length; i++) {
            let short = this.getNext();
            this.shorten(act[i], short);
            this.dictTxt += `- ${short}: ${act[i]}\n`;
        }
    }
    writeDict(removeOld = false) {
        let cfg = lib_1.AppConfig.getInstance();
        let file = path_1.join("notes", "translate-table.txt");
        if (removeOld)
            lib_1.FileUtils.rmFile(file);
        lib_1.FileUtils.writeFile(cfg.dirProject, file, this.dictTxt, false, removeOld ? "w" : "a");
    }
    shrinkFile(content, writeDict) {
        this.content = content;
        this.dictTxt = "";
        let cfg = lib_1.AppConfig.getInstance();
        let opts = cfg.options.javascript.browser.shrink;
        for (let i = 0; i < opts.length; i++) {
            let act = opts[i];
            if (act.class != undefined && act.class) {
                this.classes(act);
            }
            else if (act.functions != undefined && act.functions.length > 0) {
                this.functions(act);
            }
        }
        if (writeDict)
            this.writeDict(true);
        return this.content;
    }
}
exports.Shrinker = Shrinker;
//# sourceMappingURL=stripping.js.map