// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import ChokerStream from "./ext/choker.mjs";

let initBrowser = function (WingBlade) {
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
	if (!navObj.languages?.constructor) {
		navObj.languages = [];
	};
	if (!navObj.hardwareConcurrency) {
		navObj.hardwareConcurrency = WingBlade.rt.cores;
	};
	if (!navObj.deviceMemory) {
		navObj.deviceMemory = Math.min(2 ** Math.round(Math.log2(WingBlade.rt.memory.total / 1073741824)), 8);
	};
	if (!navObj.permissions) {
		navObj.permissions = {
			"query": (descriptor) => {
				return WingBlade.rt.perms.querySync(descriptor);
			}
		};
	};
	switch (WingBlade.rt.variant) {
		case "Node":
		case "Bun": {
			break;
		};
		case "Deno": {
			break;
		};
	};
	// Web Workers API
	switch (WingBlade.rt.variant) {
		case "Deno": {
			let WorkerVanilla = Worker;
			self.Worker = class extends EventTarget {
				#worker;
				postMessage(msg, opt) {
					this.#worker.postMessage(msg, opt);
				};
				terminate() {
					this.#worker.terminate();
				};
				constructor(url, opt = {}) {
					super();
					let upThis = this;
					url = new URL(url, `file://${WingBlade.rt.cwd()}/`).href;
					if (!opt.type || opt.type == "classic") {
						opt.type = "module";
					};
					upThis.#worker = new WorkerVanilla(url, opt);
					upThis.#worker.addEventListener("message", ({
						data, origin, source, ports
					}) => {
						upThis.dispatchEvent(new MessageEvent("message", {
							data, origin, source, ports
						}));
					});
					upThis.#worker.addEventListener("error", ({
						message, filename, lineno, colno, error
					}) => {
						upThis.dispatchEvent(new ErrorEvent("error", {
							message, filename, lineno, colno,
							error: error || new Error(message, filename, lineno)
						}));
					});
					upThis.#worker.addEventListener("messageerror", ({data}) => {
						upThis.dispatchEvent(new MessageEvent("messageerror", {
							data,
							origin,
							source,
							ports
						}));
					});
				};
			};
			break;
		};
		case "Node": {
			self.Worker = class extends EventTarget {
				#worker;
				#elPool = {};
				addEventListener(type, callback, opt) {
					let upThis = this;
					let interceptor = function (ev) {
						if (ev.data?.wbType == "!ErrorEvent") {
							for (let k in ev.data) {
								if (k != "wbType") {
									ev[k] = ev.data[k];
								};
							};
							delete ev.data;
						};
						callback.call(upThis, ev);
					};
					upThis.#elPool[callback] = interceptor;
					super.addEventListener(type, interceptor, opt);
				};
				postMessage(msg, opt) {
					this.#worker.postMessage(msg, opt);
				};
				terminate() {
					this.#worker.terminate();
				};
				constructor(url, opt = {}) {
					super();
					let upThis = this;
					url = new URL(new URL(url, `file://${WingBlade.rt.cwd()}/`).href);
					opt.env = opt.env || workerThreads.SHARE_ENV;
					upThis.#worker = new workerThreads.Worker(url, opt);
					upThis.#worker.on("message", (data) => {
						upThis.dispatchEvent(new MessageEvent("message", {
							data,
							origin: url
						}));
					});
					upThis.#worker.on("error", (err) => {
						let {
							message, filename, lineno, colno
						} = err;
						upThis.dispatchEvent(new MessageEvent("error", {
							data: {
								error: err,
								message,
								filename,
								lineno,
								colno,
								wbType: "!ErrorEvent"
							}
						}));
					});
					upThis.#worker.on("messageerror", (err) => {
						upThis.dispatchEvent(new MessageEvent("messageerror", {
							data: err,
							origin: url
						}));
					});
				};
			};
			if (!workerThreads.isMainThread) {
				self.postMessage = function (msg, opt) {
					workerThreads.parentPort.postMessage(msg, opt);
				};
				self.addEventListener = function (type, callback) {
					switch (type) {
						case "message": {
							workerThreads.parentPort.on("message", (msg) => {
								callback.call(self, new MessageEvent("message", {
									data: msg
								}));
							});
							break;
						};
					};
				};
			};
			break;
		};
	};
};

self.ChokerStream = ChokerStream;

export {
	initBrowser
};
