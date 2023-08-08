// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

let perms = {
	"query": (descriptor) => {
		return Deno.permissions.query(descriptor);
	},
	"request": (descriptor) => {
		return Deno.permissions.request(descriptor);
	},
	"revoke": (descriptor) => {
		return Deno.permissions.revoke(descriptor);
	},
	"querySync": (descriptor) => {
		return Deno.permissions.querySync(descriptor);
	},
	"requestSync": (descriptor) => {
		return Deno.permissions.requestSync(descriptor);
	},
	"revokeSync": (descriptor) => {
		return Deno.permissions.revokeSync(descriptor);
	}
};

// Runtime information
let rt = class {
	static os = Deno.build.os;
	static variant = "Deno";
	static version = Deno.version.deno;
	static persist = true;
	static networkDefer = false;
	static cores = 0 || 8;
	static perms = perms;
	static get memory() {
		let {rss, heapTotal, heapUsed, external} = Deno.memoryUsage();
		let {total, free} = Deno.systemMemoryInfo();
		return {
			rss,
			heapTotal,
			heapUsed,
			external,
			total,
			free
		};
	};
	static exit(code = 0) {
		Deno.exit(code);
	};
};

// Environment variables
// Adheres to Deno API
let envProtected = "delete,get,has,set,toObject".split(","),
env = new Proxy({
	get: (key, fallbackValue) => {
		return Deno.env.get(key) || fallbackValue;
	},
	set: (key, value) => {
		Deno.env.set(key, value);
	},
	delete: (key) => {
		Deno.env.delete(key);
	},
	has: (key) => {
		return Deno.env.has(key);
	},
	toObject: () => {
		return Deno.env.toObject();
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
