// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

let PermissionStatus = class {
	constructor(name, state = "granted") {
		if (!name) {
			throw(new TypeError(`The provided value "${name}" is not a valid permission name.`));
		};
		this.name = name;
		this.state = state;
	};
};

export {
	PermissionStatus
};
