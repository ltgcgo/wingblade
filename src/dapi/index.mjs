// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

export let Deno = {
	// Runtime Environment
	args: WingBlade.args,
	env: WingBlade.env,
	mainModule: WingBlade.main,
	noColor: WingBlade.rt.noColor,
	pid: WingBlade.rt.pid,
	ppid: WingBlade.rt.ppid,
	version: {
		deno: "1.36.4",
		v8: WingBlade.rt.versions.v8,
		wingblade: WingBlade.version
	},
	chdir: WingBlade.rt.chdir,
	cwd: WingBlade.rt.cwd,
	execPath: () => {
		WingBlade.rt.execPath
	},
	exit: WingBlade.rt.exit,
	gid: WingBlade.rt.gid,
	hostname: WingBlade.rt.hostname,
	loadavg: WingBlade.rt.loadavg,
	memoryUsage: () => {
		return WingBlade.rt.memory;
	},
	networkInterfaces: WingBlade.rt.interfaces,
	osUptime: WingBlade.rt.osUptime,
	systemMemoryInfo: WingBlade.rt.systemMemoryInfo,
	uid: WingBlade.rt.uid,
	// HTTP server
	serve: WingBlade.web.serve
};
