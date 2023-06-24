// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {serve} from "../../libs/denoServe/server.js";

// Runtime information
let rt = class {
	static os = Deno.build.os;
	static variant = "Deno";
	static version = Deno.version.deno;
	static persist = true;
	static networkDefer = false;
	static get memUsed() {
		return Deno.memoryUsage();
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
				return !!target[key];
			};
		} else {
			return false;
		};
	},
	deleteProperty: (target, key) => {
		if (envProtected.indexOf(key) < 0) {
			target.delete(key);
		} else {
			throw(new Error(`Tried to delete protected properties`));
		};
	}
});

// File operations
let file = class {
	static async read(path, opt) {
		return await Deno.readFile(path, opt);
	};
	static async write(path, data, opt) {
		await Deno.writeFile(path, data, opt);
	};
};

// Network interfaces
let net = class {};

// Web interfaces
let web = class {
	static serve(handler, opt = {}) {
		if (!opt?.onListen) {
			opt.onListen = function ({port, hostname}) {
				console.error(`WingBlade serving at http://${hostname}:${port}`);
			};
		};
		if (!opt?.hostname) {
			opt.hostname = "127.0.0.1";
		};
		if (!opt?.port) {
			opt.port = 8000;
		};
		return serve(handler, opt);
	};
	static acceptWs(req, opt) {
		return Deno.upgradeWebSocket(req, opt);
	};
};

// Common utilities
let util = class {
	static randomInt(cap) {
		return Math.floor(Math.random() * cap);
	};
	static sleep(ms, maxAdd = 0) {
		return new Promise((y) => {
			let as = AbortSignal.timeout(ms + Math.floor(maxAdd * Math.random()));
			as.addEventListener("abort", () => {
				y();
			});
		});
	};
};

let WingBlade = class {
	static args = Deno.args;
	static rt = rt;
	static env = env;
	static file = file;
	static net = net;
	static web = web;
	static util = util;
};

export {
	WingBlade
};
