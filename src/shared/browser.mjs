// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import ChokerStream from "./ext/choker.mjs";

let initNavigator = function (WingBlade) {
	if (!self.navigator) {
		self.navigator = {};
	};
	let navObj = navigator;
	if (!navObj.userAgent) {
		navObj.userAgent = `${WingBlade.rt.variant}/${WingBlade.rt.version}`;
	};
	if (!navObj.language) {
		navObj.language = null;
	};
	if (!navObj.languages?.constructor) {
		navObj.languages = [];
	};
	if (!navObj.hardwareConcurrency) {
		navObj.hardwareConcurrency = WingBlade.rt.cores;
	};
	if (!navObj.deviceMemory) {
		navObj.deviceMemory = Math.min(2 ** Math.round(Math.log2(WingBlade.rt.memory.total / 1073741824)), 8);
	};
	if (!navObj.permissions) {
		navObj.permissions = {
			"query": (descriptor) => {
				return WingBlade.rt.perms.querySync(descriptor);
			}
		};
	};
	switch (WingBlade.rt.variant) {
		case "Node":
		case "Bun": {
			break;
		};
		case "Deno": {
			break;
		};
	};
};

self.ChokerStream = ChokerStream;

export {
	initNavigator
};
