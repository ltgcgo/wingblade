// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

// An example WingBlade program

let main = async function (args) {
	WingBlade.web.serve(async (req, client) => {
		throw new Error("An error");
	});
};

export {
	main
};
