"use strict";

let rt = globalThis.Bun ? "bun" : (globalThis.Deno ? "deno" : "node");
let {WingBlade} = await import(`../dist/${rt}.mjs`);

switch (WingBlade.args[0]) {
	case "0": {
		let choker = new ChokerStream(16);
		choker.source.json().then(console.info);
		choker.attach((await fetch(`https://api.ip.sb/geoip/`)).body);
		break;
	};
	case "1": {
		let choker = new ChokerStream(64, true);
		choker.source.json().then(console.info);
		choker.attach((await fetch(`https://api.ip.sb/geoip/`)).body);
		break;
	};
	case "2": {
		let choker = new ChokerStream(16384, true);
		choker.source.array().then(console.info);
		choker.attach((await fetch(`https://gh.ltgc.cc/midi-demo-data/collection/octavia/KANDI8.mid`)).body);
		break;
	};
	default: {
		console.error("No ChokerStream test matched.");
	};
};