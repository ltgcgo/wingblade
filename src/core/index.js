// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

// An example WingBlade program

let main = async function (args) {
	WingBlade.web.serve(async (req, client) => {
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
};

export {
	main
};
