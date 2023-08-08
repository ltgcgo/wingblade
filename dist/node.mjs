// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.
"use strict";import{WebSocket,WebSocketServer as WebSocketService}from"ws";import{fetch,Request,Response}from"undici";import os from"node:os";import fs from"node:fs";import http from"node:http";import crypto from"node:crypto";import dns from"node:dns";if(!globalThis.self){globalThis.self=globalThis};let R=Object.defineProperty;let I=(e,t,r)=>t in e?R(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;let i=(e,t,r)=>(I(e,typeof t!="symbol"?t+"":t,r),r);let p=class{constructor(e,t="granted"){if(!e)throw new TypeError(`The provided value "${e}" is not a valid permission name.`);this.name=e,this.state=t}};let M={query:async e=>new p(e?.name),request:async e=>new p(e?.name),revoke:async e=>new p(e?.name),querySync:e=>new p(e?.name),requestSync:e=>new p(e?.name),revokeSync:e=>new p(e?.name)},h,S=(h=class{static get memory(){let{rss:e,heapTotal:t,heapUsed:r,external:s}=process.memoryUsage(),c=os.totalmem(),f=os.freemem();return{rss:e,heapTotal:t,heapUsed:r,external:s,total:c,free:f}}static exit(e=0){process.exit(e)}},i(h,"os",os.platform()),i(h,"variant","Node"),i(h,"version",process.version.replace("v","")),i(h,"persist",!0),i(h,"networkDefer",!1),i(h,"cores",os.cpus().length),i(h,"perms",M),h),m="delete,get,has,set,toObject".split(","),x=new Proxy({get:(e,t)=>process.env[e]||t,set:(e,t)=>{process.env[e]=t},delete:e=>{delete process.env[e]},has:e=>!!process.env[e],toObject:()=>process.env},{get:(e,t)=>m.indexOf(t)<0&&t.constructor==String?e.get(t):e[t],set:(e,t,r)=>{if(m.indexOf(t)<0)if(t.constructor==String)e.set(t,r);else throw new TypeError("Invalid type for key");else throw new Error("Tried to write protected properties")},has:(e,t)=>m.indexOf(t)<0?t.constructor==String?e.has(t):e[t]!=null:!1,deleteProperty:(e,t)=>{if(m.indexOf(t)<0)if(t.constructor==String)e.delete(t);else throw new TypeError("Invalid type for key");else throw new Error("Tried to delete protected properties")}});let A=class{static async read(e,t){return new Uint8Array((await fs.promises.readFile(e,t)).buffer)}static async write(e,t,r){let s={flag:"w"};r.append&&(s.flag="a"),r.signal&&(s.signal=r.signal),r.mode&&(s.mode=r.mode),await fs.promises.writeFile(e,t,s)}},O=A;let U=class extends EventTarget{#e;#s;#i;#c;#n;#d;#h;#a;#o=[];#r=[];#t=3;#l=!1;CONNECTING=0;OPEN=1;CLOSING=2;CLOSED=3;get protocol(){return this.#e}get hostname(){return this.#s}get port(){return this.#i}get readyState(){return this.#t}get source(){return this.#h}get sink(){return this.#a}addEventListener(e,t,r){e=="open"&&this.readyState==this.OPEN&&t.call(this,new Event("open")),super.addEventListener(e,t,r)}send(e){if(this.#l)throw new Error("Cannot enqueue or send data on a freed connection");this.#t!=1?this.#o.push(e):this.#a?.desiredSize<0||this.#r.length?(this.#r.push(e),this.#a.ready.then(()=>{let t=this.#r.shift();t&&this.#a.write(t)})):this.#a.write(e)}async connect(){if(this.#l)throw new Error("Cannot restart a freed connection");switch(this.#t<this.CLOSING&&console.debug(`${this.#e.toUpperCase()} connection is already open.`),this.#t=this.CONNECTING,this.#e){case"tcp":break;default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#t=this.OPEN,this.dispatchEvent(new Event("open"))}close(){switch(this.#t>this.OPEN&&console.debug(`${this.#e.toUpperCase()} connection is already closed.`),this.#t=this.CLOSING,this.#e){case"tcp":break;default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#t=this.CLOSED,this.dispatchEvent(new Event("close"))}free(){return this.close(),this.#l=!0,this.#o.splice(0,this.#o.length)}constructor({proto:e,host:t,port:r},s){super(),e=e||"tcp",t=t||"127.0.0.1",r=r||80,this.#e=e,this.#s=t,this.#i=r,this.addEventListener("open",async()=>{this.#o.forEach(c=>{this.send(c)})}),this.addEventListener("close",()=>{this.#r.length&&this.#o.splice(0,0,this.#r.splice(0,this.#r.length))}),s&&this.connect()}},E,D=(E=class{},i(E,"RawClient",U),E),C=D;let $='<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';let j=class{#e;#s;#i=!1;#c=[];#n={open:[],message:[],error:[],close:[]};addEventListener(e,t){this.#e?e!="open"?this.#e.addEventListener(e,t):t(new Event("open")):this.#n[e].push(t)}get binaryType(){return this.#e?.binaryType||""}get bufferedAmount(){return this.#e?.bufferedAmount||0}get extensions(){return this.#e?.extensions||""}get readyState(){return this.#e?.readyState||0}get url(){return this.#e?.url||this.#s}attach(e){if(this.#i)return!1;if(this.#e)throw new Error("Already attached a WebSocket object");this.#e=e;let t=this;switch(e.readyState){case 0:case 1:{for(let s in this.#n)this.#n[s].forEach(c=>{e.addEventListener(s,c)});let r=new Event("open");this.#n.open.forEach(s=>{s(r)});break}case 2:case 3:{t.dispatchEvent(new Event("close"));break}}}close(...e){return this.#i=!0,this.#e?.close(...e)}send(e){this.#e?this.#e.send(e):this.#c.push(e)}constructor(e){this.#s=e.url.replace("http","ws"),this.addEventListener("open",t=>{for(;this.#c.length>0;)this.#e.send(this.#c.shift())})}},q=class{static serve(e,t={}){let r=`file://${process.cwd()}`,s=t.port||8e3,c=t.hostname||"0.0.0.0",f=http.createServer(async function(n,a){let w,v=new ReadableStream({type:"bytes",start:o=>{w=o},cancel:o=>{},autoAllocateChunkSize:65536}),u={method:n.method,headers:n.headers},k=["GET","HEAD"].indexOf(u.method)==-1;n.on("data",o=>{w.enqueue(o)}).on("end",()=>{w.close()}),k&&(u.body=v,u.duplex="half");let g=new Request(`${n.headers["x-forwarded-proto"]||"http"}://${n.headers.host}${n.url}`,u),l;try{l=await e(g),l?.constructor!=Response&&(l=new Response(JSON.stringify(l),{headers:{"Content-Type":"text/plain"}}))}catch(o){console.error(`Request error at ${g.method} ${g.url}
${o.stack}`),l=new Response($.replace("${runtime}",WingBlade.rt.variant).replace("${stackTrace}",o.stack.replaceAll(r,"wingblade:app")),{status:502,headers:{"Content-Type":"text/html"}})}l?.headers?.forEach((o,y)=>{a.setHeader(y,o)}),a.statusCode=l?.status||200,l?.statusText&&(a.statusMessage=l.statusText),a.flushHeaders();let P=l.body.getReader(),b=!0;for(;b;)await P.read().then(({done:o,value:y})=>{o?(a.end(),b=!1):a.write(y)})});return f.on("upgrade",async(n,a,w)=>{let v={method:n.method,headers:n.headers},u=new Request(`${n.headers["x-forwarded-proto"]||"http"}://${n.headers.host}${n.url}`,v);u.raw={requester:n,socket:a,head:w},await e(u)}),f.listen(s,c,()=>{(t.onListen||function({port:n,hostname:a}){a&&(a="127.0.0.1"),console.error(`WingBlade serving at http://${a}:${n}`)})({port:s,hostname:c})}),f}static acceptWs(e,t){let r=new WebSocketService({noServer:!0}),s=new j(e);return r.handleUpgrade(e.raw.requester,e.raw.socket,e.raw.head,function(c){s.attach(c)}),{socket:s,response:new Response(null,{status:200})}}},T=q;let W=class{static randomInt(e){return Math.floor(Math.random()*e)}static sleep(e,t=0){return new Promise((r,s)=>{setTimeout(r,e+Math.floor(t*Math.random()))})}},N=W;let L=function(e){self.navigator||(self.navigator={});let t=navigator;switch(t.userAgent||(t.userAgent=`${e.rt.variant}/${e.rt.version}`),t.language||(t.language=null),t.languages?.constructor||(t.languages=[]),t.hardwareConcurrency||(t.hardwareConcurrency=e.rt.cores),t.deviceMemory||(t.deviceMemory=Math.min(2**Math.round(Math.log2(e.rt.memory.total/1073741824)),8)),t.permissions||(t.permissions={query:r=>e.rt.perms.querySync(r)}),e.rt.variant){case"Node":case"Bun":break;case"Deno":break}};let d,B=(d=class{},i(d,"args",process.argv.slice(2)),i(d,"rt",S),i(d,"env",x),i(d,"file",O),i(d,"net",C),i(d,"web",T),i(d,"util",N),d);L(B);export{B as WingBlade};
