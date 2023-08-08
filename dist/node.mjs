// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.
"use strict";import{WebSocket,WebSocketServer as WebSocketService}from"ws";import{fetch,Request,Response}from"undici";import os from"node:os";import fs from"node:fs";import http from"node:http";import crypto from"node:crypto";if(!globalThis.self){globalThis.self=globalThis};let P=Object.defineProperty;let W=(e,t,s)=>t in e?P(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;let i=(e,t,s)=>(W(e,typeof t!="symbol"?t+"":t,s),s);let u,x=(u=class{static get memUsed(){return process.memoryUsage()}static exit(e=0){process.exit(e)}},i(u,"os",os.platform()),i(u,"variant","Node"),i(u,"version",process.version.replace("v","")),i(u,"persist",!0),i(u,"networkDefer",!1),u),f="delete,get,has,set,toObject".split(","),S=new Proxy({get:(e,t)=>process.env[e]||t,set:(e,t)=>{process.env[e]=t},delete:e=>{delete process.env[e]},has:e=>!!process.env[e],toObject:()=>process.env},{get:(e,t)=>f.indexOf(t)<0&&t.constructor==String?e.get(t):e[t],set:(e,t,s)=>{if(f.indexOf(t)<0)if(t.constructor==String)e.set(t,s);else throw new TypeError("Invalid type for key");else throw new Error("Tried to write protected properties")},has:(e,t)=>f.indexOf(t)<0?t.constructor==String?e.has(t):e[t]!=null:!1,deleteProperty:(e,t)=>{if(f.indexOf(t)<0)if(t.constructor==String)e.delete(t);else throw new TypeError("Invalid type for key");else throw new Error("Tried to delete protected properties")}});let A=class{static async read(e,t){return new Uint8Array((await fs.promises.readFile(e,t)).buffer)}static async write(e,t,s){let r={flag:"w"};s.append&&(r.flag="a"),s.signal&&(r.signal=s.signal),s.mode&&(r.mode=s.mode),await fs.promises.writeFile(e,t,r)}},O=A;let B=class extends EventTarget{#e;#r;#i;#l;#n;#d;#h;#a;#o=[];#s=[];#t=3;#c=!1;CONNECTING=0;OPEN=1;CLOSING=2;CLOSED=3;get protocol(){return this.#e}get hostname(){return this.#r}get port(){return this.#i}get readyState(){return this.#t}get source(){return this.#h}get sink(){return this.#a}addEventListener(e,t,s){e=="open"&&this.readyState==this.OPEN&&t.call(this,new Event("open")),super.addEventListener(e,t,s)}send(e){if(this.#c)throw new Error("Cannot enqueue or send data on a freed connection");this.#t!=1?this.#o.push(e):this.#a?.desiredSize<0||this.#s.length?(this.#s.push(e),this.#a.ready.then(()=>{let t=this.#s.shift();t&&this.#a.write(t)})):this.#a.write(e)}async connect(){if(this.#c)throw new Error("Cannot restart a freed connection");switch(this.#t<this.CLOSING&&console.debug(`${this.#e.toUpperCase()} connection is already open.`),this.#t=this.CONNECTING,this.#e){case"tcp":break;default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#t=this.OPEN,this.dispatchEvent(new Event("open"))}close(){switch(this.#t>this.OPEN&&console.debug(`${this.#e.toUpperCase()} connection is already closed.`),this.#t=this.CLOSING,this.#e){case"tcp":break;default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#t=this.CLOSED,this.dispatchEvent(new Event("close"))}free(){return this.close(),this.#c=!0,this.#o.splice(0,this.#o.length)}constructor({proto:e,host:t,port:s},r){super(),e=e||"tcp",t=t||"127.0.0.1",s=s||80,this.#e=e,this.#r=t,this.#i=s,this.addEventListener("open",async()=>{this.#o.forEach(h=>{this.send(h)})}),this.addEventListener("close",()=>{this.#s.length&&this.#o.splice(0,0,this.#s.splice(0,this.#s.length))}),r&&this.connect()}},y,U=(y=class{},i(y,"RawClient",B),y),C=U;let $='<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';let D=class{#e;#r;#i=!1;#l=[];#n={open:[],message:[],error:[],close:[]};addEventListener(e,t){this.#e?e!="open"?this.#e.addEventListener(e,t):t(new Event("open")):this.#n[e].push(t)}get binaryType(){return this.#e?.binaryType||""}get bufferedAmount(){return this.#e?.bufferedAmount||0}get extensions(){return this.#e?.extensions||""}get readyState(){return this.#e?.readyState||0}get url(){return this.#e?.url||this.#r}attach(e){if(this.#i)return!1;if(this.#e)throw new Error("Already attached a WebSocket object");this.#e=e;let t=this;switch(e.readyState){case 0:case 1:{for(let r in this.#n)this.#n[r].forEach(h=>{e.addEventListener(r,h)});let s=new Event("open");this.#n.open.forEach(r=>{r(s)});break}case 2:case 3:{t.dispatchEvent(new Event("close"));break}}}close(...e){return this.#i=!0,this.#e?.close(...e)}send(e){this.#e?this.#e.send(e):this.#l.push(e)}constructor(e){this.#r=e.url.replace("http","ws"),this.addEventListener("open",t=>{for(;this.#l.length>0;)this.#e.send(this.#l.shift())})}},M=class{static serve(e,t={}){let s=`file://${process.cwd()}`,r=t.port||8e3,h=t.hostname||"0.0.0.0",g=http.createServer(async function(n,a){let p,v=new ReadableStream({type:"bytes",start:o=>{p=o},cancel:o=>{},autoAllocateChunkSize:65536}),d={method:n.method,headers:n.headers},k=["GET","HEAD"].indexOf(d.method)==-1;n.on("data",o=>{p.enqueue(o)}).on("end",()=>{p.close()}),k&&(d.body=v,d.duplex="half");let m=new Request(`${n.headers["x-forwarded-proto"]||"http"}://${n.headers.host}${n.url}`,d),l;try{l=await e(m),l?.constructor!=Response&&(l=new Response(JSON.stringify(l),{headers:{"Content-Type":"text/plain"}}))}catch(o){console.error(`Request error at ${m.method} ${m.url}
${o.stack}`),l=new Response($.replace("${runtime}",WingBlade.rt.variant).replace("${stackTrace}",o.stack.replaceAll(s,"wingblade:app")),{status:502,headers:{"Content-Type":"text/html"}})}l?.headers?.forEach((o,E)=>{a.setHeader(E,o)}),a.statusCode=l?.status||200,l?.statusText&&(a.statusMessage=l.statusText),a.flushHeaders();let I=l.body.getReader(),b=!0;for(;b;)await I.read().then(({done:o,value:E})=>{o?(a.end(),b=!1):a.write(E)})});return g.on("upgrade",async(n,a,p)=>{let v={method:n.method,headers:n.headers},d=new Request(`${n.headers["x-forwarded-proto"]||"http"}://${n.headers.host}${n.url}`,v);d.raw={requester:n,socket:a,head:p},await e(d)}),g.listen(r,h,()=>{(t.onListen||function({port:n,hostname:a}){a&&(a="127.0.0.1"),console.error(`WingBlade serving at http://${a}:${n}`)})({port:r,hostname:h})}),g}static acceptWs(e,t){let s=new WebSocketService({noServer:!0}),r=new D(e);return s.handleUpgrade(e.raw.requester,e.raw.socket,e.raw.head,function(h){r.attach(h)}),{socket:r,response:new Response(null,{status:200})}}},T=M;let j=class{static randomInt(e){return Math.floor(Math.random()*e)}static sleep(e,t=0){return new Promise((s,r)=>{setTimeout(s,e+Math.floor(t*Math.random()))})}},N=j;let w,L=function(e){w=e},R=function(){self.navigator||(self.navigator={});let e=navigator;switch(e.userAgent||(e.userAgent=`${w.rt.variant}/${w.rt.version}`),e.language||(e.language=null),w.rt.variant){case"node":{e.hardwareConcurrency||(e.hardwareConcurrency=os.cpus().length);break}}};let c,F=(c=class{},i(c,"args",process.argv.slice(2)),i(c,"rt",x),i(c,"env",S),i(c,"file",O),i(c,"net",C),i(c,"web",T),i(c,"util",N),c);L(F);R();export{F as WingBlade};
