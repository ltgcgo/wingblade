// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

if (self.ReadableStream) {
	ReadableStream.prototype.array = async function () {
		let reader = this.getReader();
		let bufferList = [];
		let resume = true;
		while (resume) {
			let {done, value} = await reader.read();
			if (done) {
				resume = false;
			};
			if (value?.byteLength) {
				bufferList.push((new Uint8Array(value.buffer)).subarray(value.byteOffset, value.byteLength));
			};
		};
		return bufferList;
	};
	ReadableStream.prototype.arrayBuffer = async function () {
		let bufferList = await this.array();
		return Buffer.concat(bufferList);
	};
	ReadableStream.prototype.blob = async function () {
		return new Blob(await this.array());
	};
	ReadableStream.prototype.text = async function (encoding = "utf-8") {
		let buffer = await this.arrayBuffer();
		return (new TextDecoder(encoding, {
			"fatal": true
		})).decode(buffer);
	};
	ReadableStream.prototype.json = async function (encoding) {
		return JSON.parse(await this.text(encoding));
	};
} else {
	throw(`ReadableStream not present in this runtime.`);
};
