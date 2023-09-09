"use strict";

let {WingBlade} = await import(`../dist/${globalThis.Deno ? "deno" : globalThis.Bun ? "bun" : "node"}.mjs`);

//console.debug(self.);

try {
console.debug(`w: ${WingBlade.env.get("aVar")}`);
addEventListener("message", ({data}) => {
	console.debug(`W: ${JSON.stringify(data)}`);
	WingBlade.env.set("aVar", "bValue");
	console.debug(`w: ${WingBlade.env.get("aVar")}`);
	postMessage("Message!");
});
} catch (err) {
	console.error(err);
};

await WingBlade.util.sleep(1000);
throw(new Error("Just some error."));