// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// Common utilities
let util = class {
	static randomInt(cap) {
		return Math.floor(Math.random() * cap);
	};
	static sleep(ms, maxAdd = 0) {
		return new Promise((y, n) => {
			setTimeout(y, ms + Math.floor(maxAdd * Math.random()));
		});
	};
};

export default util;
