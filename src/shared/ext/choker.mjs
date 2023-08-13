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
		console.debug(`ChokerStream constructing...`);
		let upThis = this;
		upThis.#chunk = maxChunkSize;
		upThis.alwaysCopy = alwaysCopy;
		upThis.#strategy = new ByteLengthQueuingStrategy({
			"highWaterMark": maxChunkSize
		});
		let bufferLength = 0, buffer, totalReadBytes = 0, cycleReadBytes = 0, currentWalkedBytes = 0;
		upThis.#sink = new ReadableStream({
			"cancel": async (reason) => {
				// Switch to the proxy sink if it's used instead
				//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream cancel.`);
				await upThis.#source.cancel(reason);
			},
			"start": async (controller) => {
				//upThis.#calls ++;
				//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream start.`);
			},
			"pull": async (controller) => {
				upThis.#calls ++;
				//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream drain.`);
				let useCopy = false;
				//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Waiting for upstream attachment...`);
				await upThis.#attachSignal.wait();
				//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Waiting for upstream data...`);
				let resume = true, readBytes = 0;
				while (resume && readBytes < upThis.#chunk) {
					let {done, value} = await upThis.#reader.read();
					let valueSize = value?.byteLength || 0;
					readBytes += valueSize;
					cycleReadBytes += valueSize;
					console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read ${valueSize} byte(s). Cycle: ${cycleReadBytes} B.`);
					let flushedBytes = 0, // How many in a session
					offsetBytes = 0, // Beginning of the last offset
					readView,
					unfinished = true;
					if (value?.byteLength) {
						readView = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
						while (unfinished) {
							let commitBuffer;
							if (readView.byteLength < 1) {
								// Stop the cycles once flushed bytes will complete this read
								//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Cycle terminated.`);
								//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Walked bytes: ${currentWalkedBytes} B.`);
								unfinished = false;
							};
							if (bufferLength) {
								// Load the buffer with this cycle
								let flushBuffer = readView.subarray(0, upThis.#chunk - bufferLength);
								buffer.set(flushBuffer, bufferLength);
								//currentWalkedBytes += flushBuffer.byteLength;
								//flushedBytes += flushBuffer.byteLength;
								if (bufferLength + flushBuffer.byteLength < upThis.#chunk) {
									// Grow the buffer
									//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read window smaller than chunk (${bufferLength} + ${flushBuffer.byteLength} < ${upThis.#chunk}). Writing to cache.`);
									bufferLength += readView.byteLength;
								} else {
									// Set and clear the buffer
									//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read window satisfies commit criteria (${bufferLength} + ${flushBuffer.byteLength}) = ${upThis.#chunk}). Using cached commit buffer.`);
									commitBuffer = buffer;
									bufferLength = 0;
									buffer = new Uint8Array(upThis.#chunk);
								};
								readView = readView.subarray(flushBuffer.byteLength);
								//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Walked bytes: ${currentWalkedBytes} B.`);
							} else {
								// Buffer should be clean by now
								if (readView.byteLength < upThis.#chunk) {
									//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Writing to buffer (${readView.byteLength}).`);
									bufferLength = readView.byteLength;
									if (buffer?.constructor != Uint8Array) {
										buffer = new Uint8Array(upThis.#chunk);
									};
									buffer.set(readView);
									//currentWalkedBytes += readView.byteLength;
								} else {
									let targetBuffer = readView.subarray(0, upThis.#chunk);
									if (true || upThis.alwaysCopy) {
										// Commit the copied buffer
										//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Buffer copy (${readView.byteLength}).`);
										commitBuffer = new Uint8Array(upThis.#chunk);
										commitBuffer.set(targetBuffer);
									} else {
										// Commit the original slice
										//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Buffer view (${readView.byteLength}).`);
										commitBuffer = targetBuffer;
									};
									//currentWalkedBytes += targetBuffer.byteLength;
								};
								readView = readView.subarray(upThis.#chunk);
								//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Walked bytes: ${currentWalkedBytes} B.`);
							};
							if (commitBuffer) {
								//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Buffer committed (${commitBuffer.byteLength || 0}).`);
								controller.enqueue(commitBuffer);
								currentWalkedBytes += commitBuffer.byteLength;
								//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Walked bytes: ${currentWalkedBytes} B.`);
							}/* else {
								console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Nothing to commit.`);
							}*/;
						};
					};
					//console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read finished. Cycle: ${totalReadBytes} B.`);
					if (done) {
						console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Stream finished.`);
						if (bufferLength) {
							controller.enqueue(buffer.subarray(0, bufferLength));
							console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Flushed ${bufferLength} bytes.`);
						};
						controller.close();
						resume = false;
					};
				};
				totalReadBytes += readBytes;
				console.debug(`[${upThis.#calls.toString().padStart(4, "0")}] Read finished. Total: ${totalReadBytes} B.`);
			}
		}, this.#strategy);
		console.debug(`ChokerStream constructed.`);
	};
};

export default ChokerStream;
