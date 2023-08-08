// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

let WingBlade;

let initEnv = function (wbObj) {
	WingBlade = wbObj;
};

let initNavigator = function () {
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
	switch (WingBlade.rt.variant) {
		case "node": {
			if (!navObj.hardwareConcurrency) {
				navObj.hardwareConcurrency = os.cpus().length;
			};
			break;
		};
	};
};

export {
	initEnv,
	initNavigator
};
