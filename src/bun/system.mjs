// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// Runtime information
let rt = class {
	static os = process.platform;
	static variant = "Bun";
	static version = Bun.version;
	static persist = true;
	static networkDefer = false;
	static get memUsed() {
		return {
			rss: 0,
			heapTotal: 0,
			heapUsed: 0,
			external: 0
		};
	};
	static exit(code = 0) {
		process.exit(code);
	};
};

// Environment variables
// Adheres to Deno API
let envProtected = "delete,get,has,set,toObject".split(","),
env = new Proxy({
	get: (key, fallbackValue) => {
		return Bun.env[key] || fallbackValue;
	},
	set: (key, value) => {
		Bun.env[key] = value;
	},
	delete: (key) => {
		delete Bun.env[key];
	},
	has: (key) => {
		return !!Bun.env[key];
	},
	toObject: () => {
		return Bun.env;
	}
}, {
	get: (target, key) => {
		if (envProtected.indexOf(key) < 0) {
			if (key.constructor == String) {
				return target.get(key);
			} else {
				return target[key];
			};
		} else {
			return target[key];
		};
	},
	set: (target, key, value) => {
		if (envProtected.indexOf(key) < 0) {
			if (key.constructor == String) {
				target.set(key, value);
			} else {
				throw(new TypeError(`Invalid type for key`));
			};
		} else {
			throw(new Error(`Tried to write protected properties`));
		};
	},
	has: (target, key) => {
		if (envProtected.indexOf(key) < 0) {
			if (key.constructor == String) {
				return target.has(key);
			} else {
				return target[key] != undefined;
			};
		} else {
			return false;
		};
	},
	deleteProperty: (target, key) => {
		if (envProtected.indexOf(key) < 0) {
			if (key.constructor == String) {
				target.delete(key);
			} else {
				throw(new TypeError(`Invalid type for key`));
			};
		} else {
			throw(new Error(`Tried to delete protected properties`));
		};
	}
});

export {
	rt,
	env
};
