var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
var __publicField = (obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value);

// src/deno/system.mjs
var _a, rt = (_a = class {
  static get memUsed() {
    return Deno.memoryUsage();
  }
  static exit(code = 0) {
    Deno.exit(code);
  }
}, __publicField(_a, "os", Deno.build.os), __publicField(_a, "variant", "Deno"), __publicField(_a, "version", Deno.version.deno), __publicField(_a, "persist", !0), __publicField(_a, "networkDefer", !1), _a), envProtected = "delete,get,has,set,toObject".split(","), env = new Proxy({
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
var file = class {
  static async read(path, opt) {
    return await Deno.readFile(path, opt);
  }
  static async write(path, data, opt) {
    await Deno.writeFile(path, data, opt);
  }
}, file_default = file;

// src/deno/net.mjs
var net = class {
}, net_default = net;

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
var MuxAsyncIterator = class {
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
var error_default = '<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';

// src/deno/web.mjs
var web = class {
  static serve(handler, opt = {}) {
    let cwdPath = `file://${Deno.cwd()}`;
    return opt?.onListen || (opt.onListen = function({ port, hostname }) {
      hostname == "0.0.0.0" && (hostname = "127.0.0.1"), console.error(`WingBlade serving at http://${hostname}:${port}`);
    }), opt?.hostname || (opt.hostname = "0.0.0.0"), opt?.port || (opt.port = 8e3), serve(async (request, connInfo) => {
      try {
        let response = await handler(request, connInfo);
        return response?.constructor == Response ? response : new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json"
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

// src/deno/index.mjs
var _a2, WingBlade2 = (_a2 = class {
}, __publicField(_a2, "args", Deno.args), __publicField(_a2, "rt", rt), __publicField(_a2, "env", env), __publicField(_a2, "file", file_default), __publicField(_a2, "net", net_default), __publicField(_a2, "web", web_default), __publicField(_a2, "util", util_default), _a2);
export {
  WingBlade2 as WingBlade
};
