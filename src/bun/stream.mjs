// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

if (self.ReadableStream) {
	ReadableStream.prototype.array = function () {
		return Bun.readableStreamToArray(this);
	};
	ReadableStream.prototype.arrayBuffer = function () {
		return Bun.readableStreamToArrayBuffer(this);
	};
	ReadableStream.prototype.blob = function () {
		return Bun.readableStreamToBlob(this);
	};
	ReadableStream.prototype.json = function () {
		return Bun.readableStreamToJSON(this);
	};
	ReadableStream.prototype.text = function () {
		return Bun.readableStreamToText(this);
	};
} else {
	throw(`ReadableStream not present in this runtime.`);
};
