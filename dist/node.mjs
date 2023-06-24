"use strict";import{WebSocket,WebSocketServer as WebSocketService}from"ws";import{fetch,Request,Response}from"undici";import os from"node:os";import fs from"node:fs";import http from"node:http";import crypto from"node:crypto";
if(!globalThis.self){globalThis.self=globalThis};
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
var __publicField = (obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value);

// src/node/system.mjs
var _a, rt = (_a = class {
  static get memUsed() {
    return process.memoryUsage();
  }
  static exit(code = 0) {
    process.exit(code);
  }
}, __publicField(_a, "os", os.platform()), __publicField(_a, "variant", "Node"), __publicField(_a, "version", process.version.replace("v", "")), __publicField(_a, "persist", !0), __publicField(_a, "networkDefer", !1), _a), envProtected = "delete,get,has,set,toObject".split(","), env = new Proxy({
  get: (key, fallbackValue) => process.env[key] || fallbackValue,
  set: (key, value) => {
    process.env[key] = value;
  },
  delete: (key) => {
    delete process.env[key];
  },
  has: (key) => !!process.env[key],
  toObject: () => process.env
}, {
  get: (target, key) => envProtected.indexOf(key) < 0 && key.constructor == String ? target.get(key) : target[key],
  set: (target, key, value) => {
    if (envProtected.indexOf(key) < 0)
      if (key.constructor == String)
        target.set(key, value);
      else
        throw new TypeError("Invalid type for key");
    else
      throw new Error("Tried to write protected properties");
  },
  has: (target, key) => envProtected.indexOf(key) < 0 ? key.constructor == String ? target.has(key) : target[key] != null : !1,
  deleteProperty: (target, key) => {
    if (envProtected.indexOf(key) < 0)
      if (key.constructor == String)
        target.delete(key);
      else
        throw new TypeError("Invalid type for key");
    else
      throw new Error("Tried to delete protected properties");
  }
});

// src/node/file.mjs
var file = class {
  static async read(path, opt) {
    return new Uint8Array((await fs.promises.readFile(path, opt)).buffer);
  }
  static async write(path, data, opt) {
    let newOpt = {
      flag: "w"
    };
    opt.append && (newOpt.flag = "a"), opt.signal && (newOpt.signal = opt.signal), opt.mode && (newOpt.mode = opt.mode), await fs.promises.writeFile(path, data, newOpt);
  }
}, file_default = file;

// src/node/net.mjs
var net = class {
}, net_default = net;

// src/shared/error.htm
var error_default = '<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';

// src/node/web.mjs
var WebSocketServer = class {
  #attached;
  #url;
  #closed = !1;
  #dataQueue = [];
  #events = {
    open: [],
    message: [],
    error: [],
    close: []
  };
  addEventListener(type, handler) {
    this.#attached ? type != "open" ? this.#attached.addEventListener(type, handler) : handler(new Event("open")) : this.#events[type].push(handler);
  }
  get binaryType() {
    return this.#attached?.binaryType || "";
  }
  get bufferedAmount() {
    return this.#attached?.bufferedAmount || 0;
  }
  get extensions() {
    return this.#attached?.extensions || "";
  }
  get readyState() {
    return this.#attached?.readyState || 0;
  }
  get url() {
    return this.#attached?.url || this.#url;
  }
  attach(wsService) {
    if (this.#closed)
      return !1;
    if (this.#attached)
      throw new Error("Already attached a WebSocket object");
    this.#attached = wsService;
    let upThis = this;
    switch (wsService.readyState) {
      case 0:
      case 1: {
        for (let type in this.#events)
          this.#events[type].forEach((e) => {
            wsService.addEventListener(type, e);
          });
        let openEvent = new Event("open");
        this.#events.open.forEach((e) => {
          e(openEvent);
        });
        break;
      }
      case 2:
      case 3: {
        upThis.dispatchEvent(new Event("close"));
        break;
      }
    }
  }
  close(...args) {
    return this.#closed = !0, this.#attached?.close(...args);
  }
  send(data) {
    this.#attached ? this.#attached.send(data) : this.#dataQueue.push(data);
  }
  constructor(request) {
    this.#url = request.url.replace("http", "ws"), this.addEventListener("open", (ev) => {
      for (; this.#dataQueue.length > 0; )
        this.#attached.send(this.#dataQueue.shift());
    });
  }
}, web = class {
  static serve(handler, opt = {}) {
    let cwdPath = `file://${process.cwd()}`, port = opt.port || 8e3, hostname = opt.hostname || "127.0.0.1", server = http.createServer(async function(requester, responder) {
      let readStreamController, bodyStream = new ReadableStream({
        type: "bytes",
        start: (controller) => {
          readStreamController = controller;
        },
        cancel: (reason) => {
        },
        autoAllocateChunkSize: 65536
      }), reqOpt = {
        method: requester.method,
        headers: requester.headers
      }, bodyUsed = ["GET", "HEAD"].indexOf(reqOpt.method) == -1;
      requester.on("data", (chunk) => {
        readStreamController.enqueue(chunk);
      }).on("end", () => {
        readStreamController.close();
      }), bodyUsed && (reqOpt.body = bodyStream, reqOpt.duplex = "half");
      let request = new Request(`${requester.headers["x-forwarded-proto"] || "http"}://${requester.headers.host}${requester.url}`, reqOpt), response;
      try {
        response = await handler(request), response?.constructor != Response && (response = new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json"
          }
        }));
      } catch (err) {
        console.error(`Request error at ${request.method} ${request.url}
${err.stack}`), response = new Response(error_default.replace("${runtime}", WingBlade.rt.variant).replace("${stackTrace}", err.stack.replaceAll(cwdPath, "wingblade:app")), {
          status: 502,
          headers: {
            "Content-Type": "text/html"
          }
        });
      }
      response?.headers?.forEach((v, k) => {
        responder.setHeader(k, v);
      }), responder.statusCode = response?.status || 200, response?.statusText && (responder.statusMessage = response.statusText), responder.flushHeaders();
      let repBodyStream = response.body.getReader(), repBodyFlowing = !0;
      for (; repBodyFlowing; )
        await repBodyStream.read().then(({ done, value }) => {
          done ? (responder.end(), repBodyFlowing = !1) : responder.write(value);
        });
    });
    return server.on("upgrade", async (requester, socket, head) => {
      let reqOpt = {
        method: requester.method,
        headers: requester.headers
      }, request = new Request(`${requester.headers["x-forwarded-proto"] || "http"}://${requester.headers.host}${requester.url}`, reqOpt);
      request.raw = {
        requester,
        socket,
        head
      }, await handler(request);
    }), server.listen(port, hostname, () => {
      (opt.onListen || function({ port: port2, hostname: hostname2 }) {
        console.error(`WingBlade serving at http://${hostname2}:${port2}`);
      })({ port, hostname });
    }), server;
  }
  static acceptWs(req, opt) {
    let wsUpgrader = new WebSocketService({ noServer: !0 }), wsServer = new WebSocketServer(req);
    return wsUpgrader.handleUpgrade(req.raw.requester, req.raw.socket, req.raw.head, function(ws) {
      wsServer.attach(ws);
    }), {
      socket: wsServer,
      response: new Response(null, {
        status: 200
      })
    };
  }
}, web_default = web;

// src/shared/util.mjs
var util = class {
  static randomInt(cap) {
    return Math.floor(Math.random() * cap);
  }
  static sleep(ms, maxAdd = 0) {
    return new Promise((y) => {
      AbortSignal.timeout(ms + Math.floor(maxAdd * Math.random())).addEventListener("abort", () => {
        y();
      });
    });
  }
}, util_default = util;

// src/node/index.mjs
var _a2, WingBlade2 = (_a2 = class {
}, __publicField(_a2, "args", process.argv.slice(2)), __publicField(_a2, "rt", rt), __publicField(_a2, "env", env), __publicField(_a2, "file", file_default), __publicField(_a2, "net", net_default), __publicField(_a2, "web", web_default), __publicField(_a2, "util", util_default), _a2);
export {
  WingBlade2 as WingBlade
};
