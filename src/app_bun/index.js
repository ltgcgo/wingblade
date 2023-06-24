// The Deno interface

"use strict";

import {WingBlade} from "../bun/index.mjs";
self.WingBlade = WingBlade;

import {main} from "../core/index.js";
main(WingBlade.args);
