// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

let localToken = Symbol("cc.ltgc.wingblade:internal.file");
let validateToken = (inputToken) => {
	return localToken == inputToken;
};

export {
	localToken,
	validateToken
};
