// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import pageError from "../shared/error.htm";

// Web interfaces
let web = class {
	static serve(handler, opt = {}) {
		// Deno std/http/server.ts:serve()
		let cwdPath = `${process.cwd()}`;
		let port = opt.port || 8000;
		let hostname = opt.hostname || "0.0.0.0";
		let server = Bun.serve({
			port,
			hostname,
			fetch: async (request, server) => {
				// Reply section
				request.socket = server;
				try {
					let response = await handler(request);
					if (response?.constructor != Response) {
						response = new Response(JSON.stringify(response), {
							headers: {
								"Content-Type": "application/json"
							}
						});
					};
					return response;
				} catch (err) {
					let errStack = err.stack.split("\n");
					errStack.forEach((e, i, a) => {
						a[i] = e.replace("@", " at ").replace("[native code]", "bun:internal");
					});
					errStack.unshift(`${err.name || "Error"}${err.message ? ":" : ""} ${err.message || ""}`);
					errStack = errStack.join("\n    ");
					console.error(`Request error at ${request.method} ${request.url}\n${errStack}`);
					return new Response(pageError.replace("${runtime}", WingBlade.rt.variant).replace("${stackTrace}", errStack.replaceAll(cwdPath, "wingblade:app")), {
						status: 502,
						headers: {
							"Content-Type": "text/html"
						}
					});
				};
			},
			websocket: {
				open(ws) {
					let wsServer = ws.data.wsServer;
					wsServer.attach(ws);
					wsServer.dispatchEvent(new Event("open"));
				},
				message(ws, msg) {
					ws.data.wsServer.dispatchEvent(new MessageEvent("message", {data: msg}));
				},
				close(ws, code, msg) {
					ws.data.wsServer.dispatchEvent(new Event("close"));
				}
			}
		});
		console.error(`WingBlade serving at http://${hostname == "0.0.0.0" ? "127.0.0.1" : hostname}:${port}`);
		return server;
	};
	static acceptWs(req, opt) {
		// Deno.upgradeWebSocket
		let wsServer = new WebSocketServer(req);
		req.socket.upgrade(req, {
			data: {
				wsServer
			}
		});
		return {
			socket: wsServer,
			response: new Response(null, {
				status: 200
			})
		};
	};
};

export default web;
