// The Deno interface

"use strict";

import {WingBlade} from "../deno/index.mjs";
self.WingBlade = WingBlade;

import {main} from "../core/index.js";
main(WingBlade.args);
