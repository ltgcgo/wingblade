// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {rt, env} from "./system.mjs";
import file from "./file.mjs";
import net from "./net.mjs";
import web from "./web.mjs";
import util from "./util.mjs";
import {initEnv, initNavigator} from "../shared/browser.mjs";

let WingBlade = class {
	static args = Deno.args;
	static rt = rt;
	static env = env;
	static file = file;
	static net = net;
	static web = web;
	static util = util;
};

initEnv(WingBlade);
initNavigator();

export {
	WingBlade
};
