// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {rootProps} from "./root.mjs";
import {rt, env} from "./system.mjs";
import file from "./file.mjs";
import net from "./net.mjs";
import web from "./web.mjs";
import util from "./util.mjs";
import {} from "./stream.mjs";
import {initNavigator} from "../shared/browser.mjs";
import {props} from "../shared/props.mjs";

console.debug(props);

let WingBlade = class {
	static args = rootProps.args;
	static main = rootProps.main;
	static version = props.version;
	static rt = rt;
	static env = env;
	static file = file;
	static net = net;
	static web = web;
	static util = util;
};

initNavigator(WingBlade);

export {
	WingBlade
};
