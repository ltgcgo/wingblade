// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

export let Deno = {
	// Runtime Environment
	args: WingBlade.args,
	env: WingBlade.env,
	version: {
		deno: "1.36.4",
		v8: WingBlade.rt.versions.v8,
		wingblade: WingBlade.version
	},
	exit: WingBlade.rt.exit,
	memoryUsage: function () {
		return WingBlade.rt.memory;
	}
};
