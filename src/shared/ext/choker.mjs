// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

let MiniSignal = class MiniSignal {
	#resolved = false;
	#data;
	#resolveHandle;
	resolve(data) {
		let upThis = this;
		if (!upThis.resolved) {
			upThis.#resolved = true;
			upThis.#data = data;
			if (upThis.#resolveHandle) {
				upThis.#resolveHandle(data);
				upThis.#resolveHandle = undefined;
			};
		};
	};
	wait() {
		let upThis = this;
		if (upThis.#resolved) {
			return new Promise((p) => {
				p(upThis.#data);
			});
		} else {
			return new Promise((p) => {
				upThis.#resolveHandle = p;
			})
		};
	};
};

let ChokerStream = class ChokerStream {
	#chunk = 256;
	#calls = 0;
	#source; // Stores the original source
	#reader; // Stores the original reader
	#sink; // Put the new source here
	#controller; // Controller of the new source
	#strategy; // Strategy of the new source
	#attachSignal = new MiniSignal();
	alwaysCopy = false;
	get chunk() {
		return this.#chunk;
	};
	get sink() {
		return this.#source;
	};
	get source() {
		return this.#sink;
	};
	attach(source) {
		let upThis = this;
		upThis.#source = source;
		upThis.#reader = source.getReader();
		upThis.#attachSignal.resolve();
	};
	constructor(maxChunkSize = 1024, alwaysCopy = false) {
		let upThis = this;
		upThis.#chunk = maxChunkSize;
		upThis.alwaysCopy = alwaysCopy;
		upThis.#strategy = new ByteLengthQueuingStrategy({
			"highWaterMark": maxChunkSize
		});
		let bufferLength = 0, buffer;
		upThis.#sink = new ReadableStream({
			"cancel": async (reason) => {
				// Switch to the proxy sink if it's used instead
				await upThis.#source.cancel(reason);
			},
			"start": async (controller) => {
			},
			"pull": async (controller) => {
				upThis.#calls ++;
				let useCopy = false;
				await upThis.#attachSignal.wait();
				let resume = true, readBytes = 0;
				while (resume && readBytes < upThis.#chunk) {
					let {done, value} = await upThis.#reader.read();
					let valueSize = value?.byteLength || 0;
					readBytes += valueSize;
					let realOffset = 0, // The real offset in the original stream buffer.
					readView,
					unfinished = true;
					if (value?.byteLength) {
						readView = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
						while (unfinished) {
							let commitBuffer;
							if (readView.byteLength < 1) {
								unfinished = false;
							};
							if (bufferLength) {
								// Load the buffer with this cycle
								let flushBuffer = readView.subarray(0, upThis.#chunk - bufferLength);
								buffer.set(flushBuffer, bufferLength);
								if (bufferLength + flushBuffer.byteLength < upThis.#chunk) {
									// Grow the buffer
									bufferLength += readView.byteLength;
								} else {
									// Set and clear the buffer
									commitBuffer = buffer;
									bufferLength = 0;
									buffer = new Uint8Array(upThis.#chunk);
								};
								readView = readView.subarray(flushBuffer.byteLength);
							} else {
								// Buffer should be clean by now
								if (readView.byteLength < upThis.#chunk) {
									bufferLength = readView.byteLength;
									if (buffer?.constructor != Uint8Array) {
										buffer = new Uint8Array(upThis.#chunk);
									};
									buffer.set(readView);
								} else {
									if (upThis.alwaysCopy) {
										// Copy the buffer even if zero-copy could be achieved
										commitBuffer = new Uint8Array(upThis.#chunk);
										commitBuffer.set(readView.subarray(0, upThis.#chunk));
									} else {
										// Zero-copy
										commitBuffer = readView.subarray(0, upThis.#chunk);
									};
								};
								readView = readView.subarray(upThis.#chunk);
							};
							if (commitBuffer) {
								controller.enqueue(new Uint8Array(commitBuffer));
								realOffset += commitBuffer?.byteLength;
							};
						};
					};
					if (done) {
						if (bufferLength) {
							controller.enqueue(buffer.subarray(0, bufferLength));
						};
						controller.close();
						resume = false;
					};
				};
			}
		}, this.#strategy);
	};
};

export default ChokerStream;
