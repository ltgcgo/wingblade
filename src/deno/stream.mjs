// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

if (self.ReadableStream) {
	ReadableStream.prototype.array = async function () {
		let reader = this.getReader();
		let bufferList = [];
		let resume = true;
		bufferList.byteLength = 0;
		while (resume) {
			let {done, value} = await reader.read();
			if (done) {
				resume = false;
			};
			if (value?.byteLength) {
				bufferList.push((new Uint8Array(value.buffer)).subarray(value.byteOffset, value.byteLength));
				bufferList.byteLength += value.byteLength;
			};
		};
		return bufferList;
	};
	ReadableStream.prototype.arrayBuffer = async function () {
		let bufferList = await this.array();
		let newBuffer = new Uint8Array(bufferList.byteLength);
		let offset = 0;
		bufferList.forEach((e) => {
			newBuffer.set(e, offset);
			offset += e.byteLength;
		});
		return newBuffer.buffer;
	};
	ReadableStream.prototype.blob = async function (type = "application/octet-stream") {
		return new Blob(await this.array(), {
			"type": type
		});
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
