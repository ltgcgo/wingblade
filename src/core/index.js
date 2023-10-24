// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

// An example WingBlade program

let main = async function (args) {
	// Print navigator info out
	/*console.info("{");
	for (let i in self.navigator) {
		console.info(`    "${i}": ${JSON.stringify(navigator[i])}`);
	};
	console.info("}");*/
	// Start a web server
	WingBlade.web.serve(async (req, client) => {
		console.debug(`${req.method.toUpperCase()} ${req.url}`);
		switch (true) {
			case (req.headers.get("upgrade")?.toLowerCase() == "websocket"): {
				let {socket, response} = WingBlade.web.acceptWs(req);
				socket.addEventListener("open", () => {
					console.debug(`WS opened.`);
					socket.send("I like muffins!");
				});
				socket.addEventListener("message", (ev) => {
					socket.send(ev.data);
				});
				socket.addEventListener("close", () => {
					console.debug(`WS closed.`);
				});
				return response;
				break;
			};
			default: {
				return `Hello from ${WingBlade.rt.variant} on ${WingBlade.rt.os}!`;
			};
		};
	});
	/* let tcpServer = new WingBlade.net.RawServer({port: 8005}, true);
	tcpServer.addEventListener("accept", async (ev) => {
		console.debug(`TCP accepted.`);
		let socket = ev.data;
		socket.addEventListener("open", () => {
			console.debug(`TCP opened.`);
			socket.send(new Uint8Array([240, 67, 16, 247]));
		});
		socket.addEventListener("message", ({data}) => {
			socket.send(data);
		});
		socket.addEventListener("close", () => {
			console.debug(`TCP closed.`);
		});
	}); */
};

export {
	main
};
