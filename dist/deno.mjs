// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.
"use strict";let __defProp = Object.defineProperty;
let __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
let __publicField = (obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value);

// src/deno/system.mjs
let perms = {
  query: (descriptor) => Deno.permissions.query(descriptor),
  request: (descriptor) => Deno.permissions.request(descriptor),
  revoke: (descriptor) => Deno.permissions.revoke(descriptor),
  querySync: (descriptor) => Deno.permissions.querySync(descriptor),
  requestSync: (descriptor) => Deno.permissions.requestSync(descriptor),
  revokeSync: (descriptor) => Deno.permissions.revokeSync(descriptor)
}, _a, rt = (_a = class {
  static get memory() {
    let { rss, heapTotal, heapUsed, external } = Deno.memoryUsage(), { total, free } = Deno.systemMemoryInfo();
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
    Deno.exit(code);
  }
}, __publicField(_a, "os", Deno.build.os), __publicField(_a, "variant", "Deno"), __publicField(_a, "version", Deno.version.deno), __publicField(_a, "persist", !0), __publicField(_a, "networkDefer", !1), __publicField(_a, "cores", 8), __publicField(_a, "perms", perms), _a), envProtected = "delete,get,has,set,toObject".split(","), env = new Proxy({
  get: (key, fallbackValue) => Deno.env.get(key) || fallbackValue,
  set: (key, value) => {
    Deno.env.set(key, value);
  },
  delete: (key) => {
    Deno.env.delete(key);
  },
  has: (key) => Deno.env.has(key),
  toObject: () => Deno.env.toObject()
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

// src/deno/file.mjs
let file = class {
  static async read(path, opt) {
    return await Deno.readFile(path, opt);
  }
  static async write(path, data, opt) {
    await Deno.writeFile(path, data, opt);
  }
}, file_default = file;

// src/deno/net.mjs
let RawClient = class extends EventTarget {
  // onopen, ondata, onclose, onerror
  #proto;
  #host;
  #port;
  #controller;
  #source;
  #sink;
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
    this.#readyState != this.OPEN ? this.#queue.push(data) : this.#writer?.desiredSize < 0 || this.#pool.length ? (this.#pool.push(data), this.#writer.ready.then(() => {
      let data2 = this.#pool.shift();
      data2 && this.#writer.write(data2);
    })) : this.#writer.write(data);
  }
  async connect() {
    if (this.#freed)
      throw new Error("Cannot restart a freed connection");
    if (this.#readyState < this.CLOSING) {
      console.debug(`${this.#proto.toUpperCase()} connection is already open.`);
      return;
    }
    switch (this.#readyState = this.CONNECTING, this.#proto) {
      case "tcp": {
        let conn = await Deno.connect({ hostname: this.#host, port: this.#port });
        this.#controller = conn, this.#source = conn.readable, this.#reader = conn.readable.getReader(), this.#sink = conn.writable, this.#writer = conn.writable.getWriter();
        break;
      }
      default:
        throw this.free(), new Error(`Invalid protocol "${this.#proto}"`);
    }
    this.#readyState = this.OPEN, this.dispatchEvent(new Event("open")), (async () => {
      try {
        let alive = !0;
        for (; alive; ) {
          let { value, done } = await this.#reader.read();
          alive = !done, value && this.dispatchEvent(new MessageEvent("data", { data: value })), done && this.close();
        }
      } catch (err) {
        this.dispatchEvent(new ErrorEvent("error", {
          message: err.message,
          error: err
        })), this.close();
      }
    })();
  }
  close() {
    if (this.#readyState > this.OPEN) {
      console.debug(`${this.#proto.toUpperCase()} connection is already closed.`);
      return;
    }
    switch (this.#readyState = this.CLOSING, this.#proto) {
      case "tcp": {
        let { rid } = this.#controller;
        Deno.resources()[rid] && this.#controller?.close();
        break;
      }
      default:
        throw new Error(`Invalid protocol "${this.#proto}"`);
    }
    this.#readyState = this.CLOSED, this.dispatchEvent(new Event("close"));
  }
  free() {
    return this.close(), this.#freed = !0, this.#queue.splice(0, this.#queue.length);
  }
  constructor({ proto, host, port }, immediate) {
    super(), proto = proto || "tcp", host = host || "127.0.0.1", port = port || 80, this.#proto = proto, this.#host = host, this.#port = port, this.addEventListener("open", async () => {
      this.#queue.forEach((e) => {
        this.send(e);
      });
    }), this.addEventListener("close", () => {
      this.#pool.length && this.#queue.splice(0, 0, this.#pool.splice(0, this.#pool.length));
    }), immediate && this.connect();
  }
}, RawServerSocket = class extends EventTarget {
  // onopen, ondata, onclose, onerror
  #clientAddr;
  #controller;
  #source;
  #sink;
  #reader;
  // DefaultReader
  #writer;
  // DefaultWriter
  #readyState = 1;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;
  get ip() {
    return this.#clientAddr.hostname || "0.0.0.0";
  }
  get port() {
    return this.#clientAddr.port || 0;
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
  send(data) {
    this.#readyState == 1 && this.#writer.write(data);
  }
  close() {
    this.#readyState = this.CLOSING, this.#controller.close(), this.#readyState = this.CLOSED, this.dispatchEvent(new Event("close"));
  }
  addEventListener(type, handler, opt) {
    type == "open" && this.readyState == this.OPEN && handler.call(this, new Event("open")), super.addEventListener(type, handler, opt);
  }
  constructor(denoConn) {
    super(), this.#clientAddr = denoConn.remoteAddr, this.#controller = denoConn, this.#source = denoConn.readable, this.#reader = denoConn.readable.getReader(), this.#sink = denoConn.writable, this.#writer = denoConn.writable.getWriter(), (async () => {
      let alive = !0;
      for (; alive; ) {
        let { value, done } = await this.#reader.read();
        alive = !done, value && this.dispatchEvent(new MessageEvent("data", { data: value })), done && this.close();
      }
    })();
  }
}, RawServer = class extends EventTarget {
  // onlisten, onaccept, onclose, onerror
  #proto;
  #host;
  #port;
  #reuse;
  #controller;
  #active = !1;
  #freed = !1;
  get active() {
    return this.#active;
  }
  get proto() {
    return this.#proto;
  }
  get host() {
    return this.#host;
  }
  get port() {
    return this.#port;
  }
  get reuse() {
    return this.#reuse;
  }
  async listen() {
    if (this.#freed)
      throw new Error("Cannot restart a freed connection");
    if (this.#active) {
      console.debug(`${this.#proto.toUpperCase()} server on ${this.#host}:${this.#port} is already active.`);
      return;
    }
    let upThis = this;
    try {
      switch (this.#proto) {
        case "tcp": {
          upThis.#controller = Deno.listen({
            hostname: upThis.#host,
            port: upThis.#port,
            reusePort: upThis.#reuse
          }), upThis.dispatchEvent(new Event("listen"));
          for await (let conn of upThis.#controller.accept())
            upThis.dispatchEvent(new MessageEvent("accept"), { data: new RawServerSocket(conn) });
          break;
        }
        default:
          throw upThis.free(), new Error(`Invalid protocol "${upThis.#proto}"`);
      }
    } catch {
      this.dispatchEvent(new Event("close"));
    }
  }
  close() {
    if (!this.#active) {
      console.debug(`${this.#proto.toUpperCase()} server on ${this.#host}:${this.#port} is already closed.`);
      return;
    }
    switch (this.#proto) {
      case "tcp": {
        this.#controller?.close();
        break;
      }
    }
  }
  free() {
    this.close(), this.#freed = !0;
  }
  constructor({ proto, host, port, reuse }, immediate) {
    super(), proto = proto || "tcp", host = host || "0.0.0.0", port = port || 8e3, this.#proto = proto, this.#host = host, this.#port = port, this.#reuse = reuse, this.addEventListener("listen", () => {
      console.error(`WingBlade ${proto.toUpperCase()} server listening on ${host}:${port}`);
    }), immediate && this.listen();
  }
}, _a2, net = (_a2 = class {
}, __publicField(_a2, "RawClient", RawClient), __publicField(_a2, "RawServer", RawServer), _a2), net_default = net;

// libs/denoServe/server.js
function deferred() {
  let methods, state = "pending", promise = new Promise((resolve, reject) => {
    methods = {
      async resolve(value) {
        await value, state = "fulfilled", resolve(value);
      },
      reject(reason) {
        state = "rejected", reject(reason);
      }
    };
  });
  return Object.defineProperty(promise, "state", {
    get: () => state
  }), Object.assign(promise, methods);
}
function delay(ms, options = {}) {
  let { signal, persistent } = options;
  return signal?.aborted ? Promise.reject(new DOMException("Delay was aborted.", "AbortError")) : new Promise((resolve, reject) => {
    let abort = () => {
      clearTimeout(i), reject(new DOMException("Delay was aborted.", "AbortError"));
    }, i = setTimeout(() => {
      signal?.removeEventListener("abort", abort), resolve();
    }, ms);
    if (signal?.addEventListener("abort", abort, {
      once: !0
    }), persistent === !1)
      try {
        Deno.unrefTimer(i);
      } catch (error) {
        if (!(error instanceof ReferenceError))
          throw error;
        console.error("`persistent` option is only available in Deno");
      }
  });
}
let MuxAsyncIterator = class {
  #iteratorCount = 0;
  #yields = [];
  #throws = [];
  #signal = deferred();
  add(iterable) {
    ++this.#iteratorCount, this.#callIteratorNext(iterable[Symbol.asyncIterator]());
  }
  async #callIteratorNext(iterator) {
    try {
      let { value, done } = await iterator.next();
      done ? --this.#iteratorCount : this.#yields.push({
        iterator,
        value
      });
    } catch (e) {
      this.#throws.push(e);
    }
    this.#signal.resolve();
  }
  async *iterate() {
    for (; this.#iteratorCount > 0; ) {
      await this.#signal;
      for (let i = 0; i < this.#yields.length; i++) {
        let { iterator, value } = this.#yields[i];
        yield value, this.#callIteratorNext(iterator);
      }
      if (this.#throws.length) {
        for (let e of this.#throws)
          throw e;
        this.#throws.length = 0;
      }
      this.#yields.length = 0, this.#signal = deferred();
    }
  }
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
}, ERROR_SERVER_CLOSED = "Server closed", INITIAL_ACCEPT_BACKOFF_DELAY = 5, MAX_ACCEPT_BACKOFF_DELAY = 1e3, Server = class {
  #port;
  #host;
  #handler;
  #closed = !1;
  #listeners = /* @__PURE__ */ new Set();
  #acceptBackoffDelayAbortController = new AbortController();
  #httpConnections = /* @__PURE__ */ new Set();
  #onError;
  constructor(serverInit) {
    this.#port = serverInit.port, this.#host = serverInit.hostname, this.#handler = serverInit.handler, this.#onError = serverInit.onError ?? function(error) {
      return console.error(error), new Response("Internal Server Error", {
        status: 500
      });
    };
  }
  async serve(listener) {
    if (this.#closed)
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    this.#trackListener(listener);
    try {
      return await this.#accept(listener);
    } finally {
      this.#untrackListener(listener);
      try {
        listener.close();
      } catch {
      }
    }
  }
  async listenAndServe() {
    if (this.#closed)
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    let listener = Deno.listen({
      port: this.#port ?? 80,
      hostname: this.#host ?? "0.0.0.0",
      transport: "tcp"
    });
    return await this.serve(listener);
  }
  async listenAndServeTls(certFile, keyFile) {
    if (this.#closed)
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    let listener = Deno.listenTls({
      port: this.#port ?? 443,
      hostname: this.#host ?? "0.0.0.0",
      certFile,
      keyFile,
      transport: "tcp"
    });
    return await this.serve(listener);
  }
  close() {
    if (this.#closed)
      throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
    this.#closed = !0;
    for (let listener of this.#listeners)
      try {
        listener.close();
      } catch {
      }
    this.#listeners.clear(), this.#acceptBackoffDelayAbortController.abort();
    for (let httpConn of this.#httpConnections)
      this.#closeHttpConn(httpConn);
    this.#httpConnections.clear();
  }
  get closed() {
    return this.#closed;
  }
  get addrs() {
    return Array.from(this.#listeners).map((listener) => listener.addr);
  }
  async #respond(requestEvent, connInfo) {
    let response;
    try {
      if (response = await this.#handler(requestEvent.request, connInfo), response.bodyUsed && response.body !== null)
        throw new TypeError("Response body already consumed.");
    } catch (error) {
      response = await this.#onError(error);
    }
    try {
      await requestEvent.respondWith(response);
    } catch {
    }
  }
  async #serveHttp(httpConn, connInfo) {
    for (; !this.#closed; ) {
      let requestEvent;
      try {
        requestEvent = await httpConn.nextRequest();
      } catch {
        break;
      }
      if (requestEvent === null)
        break;
      this.#respond(requestEvent, connInfo);
    }
    this.#closeHttpConn(httpConn);
  }
  async #accept(listener) {
    let acceptBackoffDelay;
    for (; !this.#closed; ) {
      let conn;
      try {
        conn = await listener.accept();
      } catch (error) {
        if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
          acceptBackoffDelay ? acceptBackoffDelay *= 2 : acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY, acceptBackoffDelay >= 1e3 && (acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY);
          try {
            await delay(acceptBackoffDelay, {
              signal: this.#acceptBackoffDelayAbortController.signal
            });
          } catch (err) {
            if (!(err instanceof DOMException && err.name === "AbortError"))
              throw err;
          }
          continue;
        }
        throw error;
      }
      acceptBackoffDelay = void 0;
      let httpConn;
      try {
        httpConn = Deno.serveHttp(conn);
      } catch {
        continue;
      }
      this.#trackHttpConnection(httpConn);
      let connInfo = {
        localAddr: conn.localAddr,
        remoteAddr: conn.remoteAddr
      };
      this.#serveHttp(httpConn, connInfo);
    }
  }
  #closeHttpConn(httpConn) {
    this.#untrackHttpConnection(httpConn);
    try {
      httpConn.close();
    } catch {
    }
  }
  #trackListener(listener) {
    this.#listeners.add(listener);
  }
  #untrackListener(listener) {
    this.#listeners.delete(listener);
  }
  #trackHttpConnection(httpConn) {
    this.#httpConnections.add(httpConn);
  }
  #untrackHttpConnection(httpConn) {
    this.#httpConnections.delete(httpConn);
  }
};
function hostnameForDisplay(hostname) {
  return hostname === "0.0.0.0" ? "localhost" : hostname;
}
async function serve(handler, options = {}) {
  let port = options.port ?? 8e3, hostname = options.hostname ?? "0.0.0.0", server = new Server({
    port,
    hostname,
    handler,
    onError: options.onError
  });
  options?.signal?.addEventListener("abort", () => server.close(), {
    once: !0
  });
  let listener = Deno.listen({
    port,
    hostname,
    transport: "tcp"
  }), s = server.serve(listener);
  return port = server.addrs[0].port, "onListen" in options ? options.onListen?.({
    port,
    hostname
  }) : console.log(`Listening on http://${hostnameForDisplay(hostname)}:${port}/`), await s;
}

// src/shared/error.htm
let error_default = '<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';

// src/deno/web.mjs
let web = class {
  static serve(handler, opt = {}) {
    let cwdPath = `file://${Deno.cwd()}`;
    return opt?.onListen || (opt.onListen = function({ port, hostname }) {
      hostname == "0.0.0.0" && (hostname = "127.0.0.1"), console.error(`WingBlade serving at http://${hostname}:${port}`);
    }), opt?.hostname || (opt.hostname = "0.0.0.0"), opt?.port || (opt.port = 8e3), serve(async (request, connInfo) => {
      try {
        let response = await handler(request, connInfo);
        return response?.constructor == Response ? response : new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "text/plain"
          }
        });
      } catch (err) {
        return console.error(`Request error at ${request.method} ${request.url}
${err.stack}`), new Response(error_default.replace("${runtime}", WingBlade.rt.variant).replace("${stackTrace}", err.stack.replaceAll(cwdPath, "wingblade:app")), {
          status: 502,
          headers: {
            "Content-Type": "text/html"
          }
        });
      }
    }, opt);
  }
  static acceptWs(req, opt) {
    return Deno.upgradeWebSocket(req, opt);
  }
}, web_default = web;

// src/deno/util.mjs
let util = class {
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

// src/deno/stream.mjs
if (self.ReadableStream)
  ReadableStream.prototype.array = async function() {
    let reader = this.getReader(), bufferList = [], resume = !0;
    for (bufferList.byteLength = 0; resume; ) {
      let { done, value } = await reader.read();
      done && (resume = !1), value?.byteLength && (bufferList.push(new Uint8Array(value.buffer).subarray(value.byteOffset, value.byteLength)), bufferList.byteLength += value.byteLength);
    }
    return bufferList;
  }, ReadableStream.prototype.arrayBuffer = async function() {
    let bufferList = await this.array(), newBuffer = new Uint8Array(bufferList.byteLength), offset = 0;
    return bufferList.forEach((e) => {
      newBuffer.set(e, offset), offset += e.byteLength;
    }), newBuffer.buffer;
  }, ReadableStream.prototype.blob = async function(type = "application/octet-stream") {
    return new Blob(await this.array(), {
      type
    });
  }, ReadableStream.prototype.text = async function(encoding = "utf-8") {
    let buffer = await this.arrayBuffer();
    return new TextDecoder(encoding, {
      fatal: !0
    }).decode(buffer);
  }, ReadableStream.prototype.json = async function(encoding) {
    return JSON.parse(await this.text(encoding));
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
    console.debug("ChokerStream constructing...");
    let upThis = this;
    upThis.#chunk = maxChunkSize, upThis.alwaysCopy = alwaysCopy, upThis.#strategy = new ByteLengthQueuingStrategy({
      highWaterMark: maxChunkSize
    });
    let bufferLength = 0, buffer;
    upThis.#sink = new ReadableStream({
      cancel: async (reason) => {
        console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream cancel.`), await upThis.#source.cancel(reason);
      },
      start: async (controller) => {
        upThis.#calls++, console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream start.`);
      },
      pull: async (controller) => {
        upThis.#calls++, console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream drain.`);
        let useCopy = !1;
        console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Waiting for upstream attachment...`), await upThis.#attachSignal.wait(), console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Waiting for upstream data...`);
        let resume = !0, readBytes = 0;
        for (; resume && readBytes < upThis.#chunk; ) {
          let { done, value } = await upThis.#reader.read(), valueSize = value?.byteLength || 0;
          readBytes += valueSize, console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read ${valueSize} byte(s). Total: ${readBytes} B.`);
          let flushedBytes = 0, offsetBytes = 0, readView, unfinished = !0;
          if (value?.byteLength)
            for (readView = new Uint8Array(value.buffer, value.byteOffset, value.byteLength); unfinished; ) {
              let commitBuffer;
              if (readView.byteLength <= flushedBytes + upThis.#chunk && (unfinished = !1), bufferLength) {
                let flushBuffer = readView.subarray(0, upThis.#chunk - bufferLength);
                buffer.set(flushBuffer, bufferLength), flushedBytes += flushBuffer.byteLength, bufferLength + readView.byteLength < upThis.#chunk ? (console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read window smaller than chunk (${bufferLength} + ${flushBuffer.byteLength}). Writing to cache.`), bufferLength += readView.byteLength) : (console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read window satisfies commit criteria (${bufferLength} + ${readView.byteLength}). Using cached commit buffer.`), commitBuffer = buffer, bufferLength = 0, buffer = new Uint8Array(upThis.#chunk)), readView = readView.subarray(flushBuffer);
              } else if (!commitBuffer) {
                if (readView.byteLength < upThis.#chunk)
                  bufferLength = readView.byteLength, buffer?.constructor != Uint8Array && (buffer = new Uint8Array(upThis.#chunk)), buffer.set(readView);
                else {
                  let targetBuffer = readView.subarray(0, upThis.#chunk);
                  commitBuffer = new Uint8Array(upThis.#chunk), commitBuffer.set(targetBuffer);
                }
                readView = readView.subarray(upThis.#chunk);
              }
              commitBuffer && controller.enqueue(commitBuffer);
            }
          done && (console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream finished.`), bufferLength && controller.enqueue(buffer.subarray(0, bufferLength)), controller.close(), resume = !1);
        }
      }
    }, this.#strategy), console.debug("ChokerStream constructed.");
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

// src/deno/index.mjs
let _a3, WingBlade2 = (_a3 = class {
}, __publicField(_a3, "args", Deno.args), __publicField(_a3, "rt", rt), __publicField(_a3, "env", env), __publicField(_a3, "file", file_default), __publicField(_a3, "net", net_default), __publicField(_a3, "web", web_default), __publicField(_a3, "util", util_default), _a3);
initNavigator(WingBlade2);
export {
  WingBlade2 as WingBlade
};
