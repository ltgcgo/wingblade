// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {PermissionStatus} from "../shared/polyfill.mjs";
import {props} from "../shared/props.mjs";

let perms = {
	"query": async (descriptor) => {
		return new PermissionStatus(descriptor?.name);
	},
	"request": async (descriptor) => {
		return new PermissionStatus(descriptor?.name);
	},
	"revoke": async (descriptor) => {
		return new PermissionStatus(descriptor?.name);
	},
	"querySync": (descriptor) => {
		return new PermissionStatus(descriptor?.name);
	},
	"requestSync": (descriptor) => {
		return new PermissionStatus(descriptor?.name);
	},
	"revokeSync": (descriptor) => {
		return new PermissionStatus(descriptor?.name);
	}
};

// Runtime information
let rt = class {
	static os = os.platform();
	static variant = "Node";
	static version = process.versions.node;
	static versions = {
		"deno": "1.36.4",
		"v8": process.versions.v8.split("-")[0],
		"wingblade": props.version
	};
	static persist = true;
	static networkDefer = false;
	static cores = os.cpus().length;
	static perms = perms;
	static noColor = process.env["NO_COLOR"]?.length > 0;
	static pid = process.pid;
	static ppid = process.ppid;
	static get memory() {
		let {rss, heapTotal, heapUsed, external} = process.memoryUsage();
		let total = os.totalmem();
		let free = os.freemem();
		return {
			rss,
			heapTotal,
			heapUsed,
			external,
			total,
			free
		};
	};
	static chdir = process.chdir;
	static cwd = process.cwd;
	static execPath = process.execPath;
	static exit(code = 0) {
		process.exit(code);
	};
	static gid() {
		return os.userInfo().gid;
	};
	static hostname = os.hostname;
	static ifMap = os.networkInterfaces;
	static interfaces() {
		let niMap = os.networkInterfaces(),
		niList = [];
		for (let ifname in niMap) {
			for (let i = 0; i < niMap[ifname].length; i ++) {
				let e = niMap[ifname][i];
				let {address, cidr, netmask, family, mac, internal, scope_id} = e;
				niList.push({
					family,
					name: ifname,
					address,
					netmask,
					scopeid: scope_id,
					cidr,
					mac
				});
			};
		};
		return niList;
	};
	static loadavg = os.loadavg;
	static memoryUsage = process.memoryUsage;
	static osUptime = os.uptime;
	static systemMemoryInfo() {
		return {
			total: os.totalmem(),
			free: os.freemem()
		};
	};
	static uid() {
		return os.userInfo().uid;
	};
};

// Environment variables
// Adheres to Deno API
let envProtected = "delete,get,has,set,toObject".split(","),
env = new Proxy({
	get: (key, fallbackValue) => {
		return process.env[key] || fallbackValue;
	},
	set: (key, value) => {
		process.env[key] = value;
	},
	delete: (key) => {
		delete process.env[key];
	},
	has: (key) => {
		return !!process.env[key];
	},
	toObject: () => {
		return process.env;
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
