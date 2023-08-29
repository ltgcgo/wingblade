// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {WingBlade as wn} from "../node/index.mjs";
import {WingBlade as wd} from "../deno/index.mjs";
import {WingBlade as wb} from "../bun/index.mjs";

let WingBlade;
switch (true) {
	case self.Deno: {
		WingBlade = wd;
		break;
	};
	case self.Bun: {
		WingBlade = wb;
		break;
	};
	default: {
		WingBlade = wn;
	};
};

export {
	WingBlade
};
