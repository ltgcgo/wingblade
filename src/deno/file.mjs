// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {localToken, validateToken} from "../shared/localToken.mjs";

const pathTypes = "auto,POSIX,DOS,URL".split(",");

// A lazy-loaded async file API
let WingFile = class {
	#open = false;
	#start = 0;
	#end = -1;
	#root;
	#path; // An absolute path
	#handle;
	lastModified;
	name;
	type;
	get size() {
		return this.#end - this.#start;
	};
	constructor(name = "", opt = {}) {
		let validated = validateToken(opt?.token),
		upThis = this;
		upThis.type = opt?.type || "";
		upThis.lastModified = opt?.lastModified || 0;
		upThis.name = opt?.name;
		if (validated) {
			upThis.#root = opt?.root;
			upThis.#start = opt?.start || 0;
			upThis.#end = opt?.end || -1;
		};
	};
	slice(start = 0, end, type = "") {
		let upThis = this;
		if (!end?.constructor) {
			end = upThis.#end;
		};
	};
	stream() {};
	async blob() {
		// Returns a File object
	};
	async text() {};
	async json() {};
	async arrayBuffer() {};
};

// File operations
let file = class {
	static POSIX = 1;
	static DOS = 2;
	static URL = 3;
	static fakePosix = "/mnt/windev".split("/");
	static fakeDOS = "Z:";
	// Simple APIs
	static async read(path, opt) {
		return await Deno.readFile(path, opt);
	};
	static async write(path, data, opt) {
		await Deno.writeFile(path, data, opt);
	};
	// Path APIs
	static get variant() {
		if (Deno.build.os == "windows") {
			return this.DOS;
		} else {
			return this.POSIX;
		};
	};
	static detect(string) {
		// Detect the format of the string
		let upThis = this,
		firstCharCode = string.charCodeAt(0);
		if (
			string[1] == ":" && firstCharCode > 64 && firstCharCode < 91 ||
			string.indexOf("\\") > -1 && string.indexOf("/") < 0
		) {
			return upThis.DOS;
		};
		try {
			let dummy = new URL(string);
			return upThis.URL;
		} catch (err) {
			return upThis.POSIX;
		};
	};
	static delimiter(variant) {
		return " /\\/"[variant || this.variant];
	};
	static basename(path, suffix) {
		let name = path.split(this.delimiter(this.detect(path))).pop();
		if (suffix) {
			return name.replace(suffix, "");
		} else {
			return name;
		};
	};
	static resolve(path = "./") {
		Deno.realPathSync(path);
	};
	static normalize(path, variant) {
		// Normalize relative paths
		let upThis = this,
		sourceVariant = upThis.detect(path),
		sourceDelim = upThis.delimiter(sourceVariant);
		if (!variant) {
			variant = sourceVariant;
		};
		let delimiter = upThis.delimiter(variant),
		doubleDelim = delimiter.repeat(2);
		while (path.indexOf(doubleDelim) > -1) {
			path = path.replace(doubleDelim, delim);
		};
		let splitPath = path.split(sourceDelim);
		switch (sourceVariant) {
			case upThis.POSIX:
			case upThis.DOS: {
				switch (splitPath[0]) {
					case "":
					case ".":
					case "..": {
						break;
					};
					default: {
						if (!(sourceVariant == upThis.DOS && splitPath[0].length == 2 && splitPath[0][1] == ":")) {
							splitPath.unshift(".");
						};
					};
				};
				break;
			};
		};
		if (sourceDelim == "\\" && delimiter == "/" && splitPath[0][1] == ":") {
			if (splitPath[0] == upThis.fakeDOS) {
				splitPath[0] = "";
			} else {
				splitPath[0] = splitPath[0][0].toLowerCase();
				splitPath.splice(0, 0, ...upThis.fakePosix);
			};
		};
		if (sourceDelim == "/" && delimiter == "\\") {
			let useFakeDos = true;
			if (splitPath[upThis.fakePosix.length]?.length == 1) {
				let matched = 0;
				upThis.fakePosix.forEach((e, i) => {
					if (splitPath[i] == e) {
						matched ++;
					};
				});
				if (matched == upThis.fakePosix.length) {
					useFakeDos = false;
					splitPath.splice(0, upThis.fakePosix.length);
					splitPath[0] = `${splitPath[0].toUpperCase()}:`;
				};
			};
			if (useFakeDos) {
				switch (splitPath[0]) {
					case ".":
					case "..": {
						break;
					};
					default: {
						splitPath[0] = upThis.fakeDOS;
					};
				};
			};
		};
		for (let i = splitPath.length - 1; i > 0; i --) {
			switch (splitPath[i]) {
				case "..": {
					splitPath.splice(i - 1, 2);
					i --;
					break;
				};
				case ".": {
					splitPath.splice(i, 1);
					break;
				};
			};
		};
		return splitPath.join(delimiter);
	};
	static isAbsolute(path) {
		switch (this.normalize(path).split(this.delimiter(this.detect(path)))[0]) {
			case ".":
			case "..": {
				return true;
				break;
			};
			default: {
				return false;
			};
		};
	};
	static relative(from, to) {
		// There still are some problems, do not use yet!
		let upThis = this;
		from = upThis.normalize(from || Deno.cwd());
		to = upThis.normalize(to || Deno.cwd());
		let fromVar = upThis.detect(from),
		toVar = upThis.detect(to);
		if (toVar != fromVar) {
			throw(new SyntaxError(`Cannot mix a ${pathTypes[toVar]} path with a ${pathTypes[fromVar]} path`));
		};
		let delim = upThis.delimiter(fromVar),
		splitF = from.split(delim),
		splitT = to.split(delim);
		/*if (!splitF[splitF.length - 1]?.length) {
			splitF.pop();
		};*/
		if (fromVar == upThis.DOS) {
			if (splitF[0] != splitT[0]) {
				throw(new Error(`Cannot switch between different drives on DOS`));
			};
		};
		let commonLevels = 0;
		splitF.forEach((e, i) => {
			if (e == splitT[i]) {
				commonLevels ++;
			};
		});
		return `${`..${delim}`.repeat(splitF.length - commonLevels) || `.${delim}`}${splitT.slice(commonLevels).join(delim)}`;
	};
	// Filesystem APIs
};

export default file;
