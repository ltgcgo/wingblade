// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.
"use strict";import os from"node:os";import dns from"node:dns";let __defProp = Object.defineProperty;
let __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
let __publicField = (obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value);

// src/bun/root.mjs
let rootProps = {
  args: Bun.argv.slice(2),
  main: Bun.main
};

// src/shared/polyfill.mjs
let PermissionStatus = class {
  constructor(name, state = "granted") {
    if (!name)
      throw new TypeError(`The provided value "${name}" is not a valid permission name.`);
    this.name = name, this.state = state;
  }
};

// src/shared/props.mjs
let props = {
  version: "0.1"
};

// src/bun/system.mjs
let perms = {
  query: async (descriptor) => new PermissionStatus(descriptor?.name),
  request: async (descriptor) => new PermissionStatus(descriptor?.name),
  revoke: async (descriptor) => new PermissionStatus(descriptor?.name),
  querySync: (descriptor) => new PermissionStatus(descriptor?.name),
  requestSync: (descriptor) => new PermissionStatus(descriptor?.name),
  revokeSync: (descriptor) => new PermissionStatus(descriptor?.name)
}, _a, rt = (_a = class {
  static get memory() {
    let { rss, heapTotal, heapUsed, external } = process.memoryUsage(), total = os.totalmem(), free = os.freemem();
    return {
      rss,
      heapTotal,
      heapUsed,
      external,
      total,
      free
    };
  }
  static exit(code = 0) {
    process.exit(code);
  }
  static gid() {
    return os.userInfo().gid;
  }
  static interfaces() {
    let niMap = os.networkInterfaces(), niList = [];
    for (let ifname in niMap)
      for (let i = 0; i < niMap[ifname].length; i++) {
        let e = niMap[ifname][i], { address, cidr, netmask, family, mac, internal, scope_id: scopeid } = e;
        mac || (mac = "00:00:00:00:00:00"), niList.push({
          family,
          name: ifname,
          address,
          netmask,
          scopeid,
          cidr,
          mac
        });
      }
    return niList;
  }
  static systemMemoryInfo() {
    return {
      total: os.totalmem(),
      free: os.freemem()
    };
  }
  static uid() {
    return os.userInfo().uid;
  }
}, __publicField(_a, "os", process.platform), __publicField(_a, "variant", "Bun"), __publicField(_a, "version", Bun.version), __publicField(_a, "versions", {
  deno: "1.36.4",
  v8: process.versions.v8.split("-")[0],
  wingblade: props.version
}), __publicField(_a, "persist", !0), __publicField(_a, "networkDefer", !1), __publicField(_a, "cores", os.cpus().length), __publicField(_a, "perms", perms), __publicField(_a, "noColor", process.env.NO_COLOR?.length > 0), __publicField(_a, "pid", process.pid), __publicField(_a, "ppid", process.ppid), __publicField(_a, "chdir", process.chdir), __publicField(_a, "cwd", process.cwd), __publicField(_a, "execPath", process.execPath), __publicField(_a, "hostname", os.hostname), __publicField(_a, "ifMap", os.networkInterfaces), __publicField(_a, "loadavg", os.loadavg), __publicField(_a, "memoryUsage", process.memoryUsage), __publicField(_a, "osUptime", os.uptime), _a), envProtected = "delete,get,has,set,toObject".split(","), env = new Proxy({
  get: (key, fallbackValue) => Bun.env[key] || fallbackValue,
  set: (key, value) => {
    Bun.env[key] = value;
  },
  delete: (key) => {
    delete Bun.env[key];
  },
  has: (key) => !!Bun.env[key],
  toObject: () => Bun.env
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

// src/bun/file.mjs
let file = class {
  static async read(path, opt) {
    return new Uint8Array(await Bun.file(path).arrayBuffer());
  }
  static async write(path, data, opt) {
    await Bun.write(path, data);
  }
}, file_default = file;

// src/bun/net.mjs
let RawClient = class extends EventTarget {
  // onopen, ondata, onclose, onerror
  #proto;
  #host;
  #port;
  #source;
  #sink;
  #controller;
  #reader;
  // DefaultReader
  #writer;
  // DefaultWriter
  #queue = [];
  // Data queue
  #pool = [];
  // Stream queue
  #readyState = 3;
  #freed = !1;
  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;
  get protocol() {
    return this.#proto;
  }
  get hostname() {
    return this.#host;
  }
  get port() {
    return this.#port;
  }
  get readyState() {
    return this.#readyState;
  }
  get source() {
    return this.#reader;
  }
  get sink() {
    return this.#writer;
  }
  addEventListener(type, handler, opt) {
    type == "open" && this.readyState == this.OPEN && handler.call(this, new Event("open")), super.addEventListener(type, handler, opt);
  }
  send(data) {
    if (this.#freed)
      throw new Error("Cannot enqueue or send data on a freed connection");
    this.#readyState != 1 ? this.#queue.push(data) : this.#writer?.desiredSize < 0 || this.#pool.length ? (this.#pool.push(data), this.#writer.ready.then(() => {
      let data2 = this.#pool.shift();
      data2 && this.#writer.write(data2);
    })) : this.#writer.write(data);
  }
  async connect() {
    if (this.#freed)
      throw new Error("Cannot restart a freed connection");
    switch (this.#readyState < this.CLOSING && console.debug(`${this.#proto.toUpperCase()} connection is already open.`), this.#readyState = this.CONNECTING, this.#proto) {
      case "tcp":
        break;
      default:
        throw this.free(), new Error(`Invalid protocol "${this.#proto}"`);
    }
    this.#readyState = this.OPEN, this.dispatchEvent(new Event("open"));
  }
  close() {
    switch (this.#readyState > this.OPEN && console.debug(`${this.#proto.toUpperCase()} connection is already closed.`), this.#readyState = this.CLOSING, this.#proto) {
      case "tcp":
        break;
      default:
        throw this.free(), new Error(`Invalid protocol "${this.#proto}"`);
    }
    this.#readyState = this.CLOSED, this.dispatchEvent(new Event("close"));
  }
  free() {
    return this.close(), this.#freed = !0, this.#queue.splice(0, this.#queue.length);
  }
  constructor({ proto, host, port }, immediateConnect) {
    super(), proto = proto || "tcp", host = host || "127.0.0.1", port = port || 80, this.#proto = proto, this.#host = host, this.#port = port, this.addEventListener("open", async () => {
      this.#queue.forEach((e) => {
        this.send(e);
      });
    }), this.addEventListener("close", () => {
      this.#pool.length && this.#queue.splice(0, 0, this.#pool.splice(0, this.#pool.length));
    }), immediateConnect && this.connect();
  }
}, _a2, net = (_a2 = class {
}, __publicField(_a2, "RawClient", RawClient), _a2), net_default = net;

// src/shared/error.htm
let error_default = '<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';

// src/bun/web.mjs
let WebSocketServer = class extends EventTarget {
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
  addEventListener(type, handler, opt) {
    type == "open" && this.readyState < 2 && handler.call(this, new Event("open")), super.addEventListener(type, handler, opt);
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
        upThis.dispatchEvent(new Event("open"));
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
    return this.#attached ? this.#attached.send(data) : (this.#dataQueue.push(data), data.length || data.size || data.byteLength || 0);
  }
  constructor(request) {
    super(), this.#url = request.url.replace("http", "ws"), this.addEventListener("open", (ev) => {
      for (; this.#dataQueue.length > 0; )
        this.#attached.send(this.#dataQueue.shift());
    });
  }
}, web = class {
  static serve(handler, opt = {}) {
    let cwdPath = `${process.cwd()}`, port = opt.port || 8e3, hostname = opt.hostname || "0.0.0.0", server = Bun.serve({
      port,
      hostname,
      fetch: async (request, server2) => {
        request.socket = server2;
        try {
          let response = await handler(request);
          return response?.constructor != Response && (response = new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "text/plain"
            }
          })), response;
        } catch (err) {
          let errStack = err.stack.split(`
`);
          return errStack.forEach((e, i, a) => {
            a[i] = e.replace("@", " at ").replace("[native code]", "bun:internal");
          }), errStack.unshift(`${err.name || "Error"}${err.message ? ":" : ""} ${err.message || ""}`), errStack = errStack.join(`
    `), console.error(`Request error at ${request.method} ${request.url}
${errStack}`), new Response(error_default.replace("${runtime}", WingBlade.rt.variant).replace("${stackTrace}", errStack.replaceAll(cwdPath, "wingblade:app")), {
            status: 502,
            headers: {
              "Content-Type": "text/html"
            }
          });
        }
      },
      websocket: {
        open(ws) {
          let wsServer = ws.data.wsServer;
          wsServer.attach(ws), wsServer.dispatchEvent(new Event("open"));
        },
        message(ws, msg) {
          ws.data.wsServer.dispatchEvent(new MessageEvent("message", { data: msg }));
        },
        close(ws, code, msg) {
          ws.data.wsServer.dispatchEvent(new Event("close"));
        }
      }
    });
    return console.error(`WingBlade serving at http://${hostname == "0.0.0.0" ? "127.0.0.1" : hostname}:${port}`), server;
  }
  static acceptWs(req, opt) {
    let wsServer = new WebSocketServer(req);
    return req.socket.upgrade(req, {
      data: {
        wsServer
      }
    }), {
      socket: wsServer,
      response: new Response(null, {
        status: 200
      })
    };
  }
}, web_default = web;

// src/bun/util.mjs
let util = class {
  static randomInt(cap) {
    return Math.floor(Math.random() * cap);
  }
  static async sleep(ms, maxAdd = 0) {
    await Bun.sleep(ms + Math.floor(maxAdd * Math.random()));
  }
}, util_default = util;

// src/bun/stream.mjs
if (self.ReadableStream)
  ReadableStream.prototype.array = function() {
    return Bun.readableStreamToArray(this);
  }, ReadableStream.prototype.arrayBuffer = function() {
    return Bun.readableStreamToArrayBuffer(this);
  }, ReadableStream.prototype.blob = function() {
    return Bun.readableStreamToBlob(this);
  }, ReadableStream.prototype.json = function() {
    return Bun.readableStreamToJSON(this);
  }, ReadableStream.prototype.text = function() {
    return Bun.readableStreamToText(this);
  };
else
  throw "ReadableStream not present in this runtime.";

// src/shared/ext/choker.mjs
let MiniSignal = class {
  #resolved = !1;
  #data;
  #resolveHandle;
  resolve(data) {
    let upThis = this;
    upThis.resolved || (upThis.#resolved = !0, upThis.#data = data, upThis.#resolveHandle && (upThis.#resolveHandle(data), upThis.#resolveHandle = void 0));
  }
  wait() {
    let upThis = this;
    return upThis.#resolved ? new Promise((p) => {
      p(upThis.#data);
    }) : new Promise((p) => {
      upThis.#resolveHandle = p;
    });
  }
}, ChokerStream = class {
  #chunk = 256;
  #calls = 0;
  #source;
  // Stores the original source
  #reader;
  // Stores the original reader
  #sink;
  // Put the new source here
  #controller;
  // Controller of the new source
  #strategy;
  // Strategy of the new source
  #attachSignal = new MiniSignal();
  alwaysCopy = !1;
  get chunk() {
    return this.#chunk;
  }
  get sink() {
    return this.#source;
  }
  get source() {
    return this.#sink;
  }
  attach(source) {
    let upThis = this;
    upThis.#source = source, upThis.#reader = source.getReader(), upThis.#attachSignal.resolve();
  }
  constructor(maxChunkSize = 1024, alwaysCopy = !1) {
    let upThis = this;
    upThis.#chunk = maxChunkSize, upThis.alwaysCopy = alwaysCopy, upThis.#strategy = new ByteLengthQueuingStrategy({
      highWaterMark: maxChunkSize
    });
    let bufferLength = 0, buffer;
    upThis.#sink = new ReadableStream({
      cancel: async (reason) => {
        await upThis.#source.cancel(reason);
      },
      start: async (controller) => {
      },
      pull: async (controller) => {
        upThis.#calls++;
        let useCopy = !1;
        await upThis.#attachSignal.wait();
        let resume = !0, readBytes = 0;
        for (; resume && readBytes < upThis.#chunk; ) {
          let { done, value } = await upThis.#reader.read(), valueSize = value?.byteLength || 0;
          readBytes += valueSize;
          let realOffset = 0, readView, unfinished = !0;
          if (value?.byteLength)
            for (readView = new Uint8Array(value.buffer, value.byteOffset, value.byteLength); unfinished; ) {
              let commitBuffer;
              if (readView.byteLength < 1 && (unfinished = !1), bufferLength) {
                let flushBuffer = readView.subarray(0, upThis.#chunk - bufferLength);
                buffer.set(flushBuffer, bufferLength), bufferLength + flushBuffer.byteLength < upThis.#chunk ? bufferLength += readView.byteLength : (commitBuffer = buffer, bufferLength = 0, buffer = new Uint8Array(upThis.#chunk)), readView = readView.subarray(flushBuffer.byteLength);
              } else
                readView.byteLength < upThis.#chunk ? (bufferLength = readView.byteLength, buffer?.constructor != Uint8Array && (buffer = new Uint8Array(upThis.#chunk)), buffer.set(readView)) : upThis.alwaysCopy ? (commitBuffer = new Uint8Array(upThis.#chunk), commitBuffer.set(readView.subarray(0, upThis.#chunk))) : commitBuffer = readView.subarray(0, upThis.#chunk), readView = readView.subarray(upThis.#chunk);
              commitBuffer && (controller.enqueue(new Uint8Array(commitBuffer)), realOffset += commitBuffer?.byteLength);
            }
          done && (bufferLength && controller.enqueue(buffer.subarray(0, bufferLength)), controller.close(), resume = !1);
        }
      }
    }, this.#strategy);
  }
}, choker_default = ChokerStream;

// src/shared/browser.mjs
let initNavigator = function(WingBlade3) {
  self.navigator || (self.navigator = {});
  let navObj = navigator;
  switch (navObj.userAgent || (navObj.userAgent = `${WingBlade3.rt.variant}/${WingBlade3.rt.version}`), navObj.language || (navObj.language = null), navObj.languages?.constructor || (navObj.languages = []), navObj.hardwareConcurrency || (navObj.hardwareConcurrency = WingBlade3.rt.cores), navObj.deviceMemory || (navObj.deviceMemory = Math.min(2 ** Math.round(Math.log2(WingBlade3.rt.memory.total / 1073741824)), 8)), navObj.permissions || (navObj.permissions = {
    query: (descriptor) => WingBlade3.rt.perms.querySync(descriptor)
  }), WingBlade3.rt.variant) {
    case "Node":
    case "Bun":
      break;
    case "Deno":
      break;
  }
};
self.ChokerStream = choker_default;

// src/bun/index.mjs
console.debug(props);
let _a3, WingBlade2 = (_a3 = class {
}, __publicField(_a3, "args", rootProps.args), __publicField(_a3, "main", rootProps.main), __publicField(_a3, "version", props.version), __publicField(_a3, "rt", rt), __publicField(_a3, "env", env), __publicField(_a3, "file", file_default), __publicField(_a3, "net", net_default), __publicField(_a3, "web", web_default), __publicField(_a3, "util", util_default), _a3);
initNavigator(WingBlade2);
export {
  WingBlade2 as WingBlade
};
