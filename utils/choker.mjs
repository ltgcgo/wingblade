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
		//let choker2 = new ChokerStream(255, true);
		let choker = new ChokerStream(parseInt(WingBlade.args[1]) || 1024, true);
		choker.source.array().then((result) => {
			//console.info(result);
			let bytes = 0;
			result.forEach((e) => {
				bytes += e.byteLength;
			});
			console.info(`Processed ${bytes} bytes.`);
		});
		//choker.attach(choker2.source);
		choker.attach((await fetch(`https://gh.ltgc.cc/midi-demo-data/collection/octavia/KANDI8.mid`)).body);
		break;
	};
	default: {
		console.error("No ChokerStream test matched.");
	};
};