// The Node interface

"use strict";

import {WingBlade} from "../node/index.mjs";
self.WingBlade = WingBlade;

import {main} from "../core/index.js";
main(WingBlade.args);
