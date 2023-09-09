"use strict";

let {WingBlade} = await import(`../dist/${globalThis.Deno ? "deno" : globalThis.Bun ? "bun" : "node"}.mjs`);

//console.debug(WingBlade);

let dW = new Worker("./utils/workerSub.js");
WingBlade.env.set("aVar", "aValue");
console.debug(`m: ${WingBlade.env.get("aVar")}`);
dW.addEventListener("error", (ev) => {
	console.debug(ev.error);
});
dW.addEventListener("message", ({data}) => {
	console.debug(`M: ${JSON.stringify(data)}`);
	console.debug(`m: ${WingBlade.env.get("aVar")}`);
});
dW.postMessage("Text!");