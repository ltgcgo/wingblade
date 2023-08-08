// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.
"use strict";let T=Object.defineProperty;let $=(t,e,r)=>e in t?T(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;let o=(t,e,r)=>($(t,typeof e!="symbol"?e+"":e,r),r);let k={query:t=>Deno.permissions.query(t),request:t=>Deno.permissions.request(t),revoke:t=>Deno.permissions.revoke(t),querySync:t=>Deno.permissions.querySync(t),requestSync:t=>Deno.permissions.requestSync(t),revokeSync:t=>Deno.permissions.revokeSync(t)},c,y=(c=class{static get memory(){let{rss:t,heapTotal:e,heapUsed:r,external:s}=Deno.memoryUsage(),{total:n,free:i}=Deno.systemMemoryInfo();return{rss:t,heapTotal:e,heapUsed:r,external:s,total:n,free:i}}static exit(t=0){Deno.exit(t)}},o(c,"os",Deno.build.os),o(c,"variant","Deno"),o(c,"version",Deno.version.deno),o(c,"persist",!0),o(c,"networkDefer",!1),o(c,"cores",8),o(c,"perms",k),c),d="delete,get,has,set,toObject".split(","),g=new Proxy({get:(t,e)=>Deno.env.get(t)||e,set:(t,e)=>{Deno.env.set(t,e)},delete:t=>{Deno.env.delete(t)},has:t=>Deno.env.has(t),toObject:()=>Deno.env.toObject()},{get:(t,e)=>d.indexOf(e)<0&&e.constructor==String?t.get(e):t[e],set:(t,e,r)=>{if(d.indexOf(e)<0)if(e.constructor==String)t.set(e,r);else throw new TypeError("Invalid type for key");else throw new Error("Tried to write protected properties")},has:(t,e)=>d.indexOf(e)<0?e.constructor==String?t.has(e):t[e]!=null:!1,deleteProperty:(t,e)=>{if(d.indexOf(e)<0)if(e.constructor==String)t.delete(e);else throw new TypeError("Invalid type for key");else throw new Error("Tried to delete protected properties")}});let A=class{static async read(t,e){return await Deno.readFile(t,e)}static async write(t,e,r){await Deno.writeFile(t,e,r)}},E=A;let N=class extends EventTarget{#e;#r;#s;#t;#n;#o;#i;#c;#h=[];#l=[];#a=3;#d=!1;CONNECTING=0;OPEN=1;CLOSING=2;CLOSED=3;get protocol(){return this.#e}get hostname(){return this.#r}get port(){return this.#s}get readyState(){return this.#a}get source(){return this.#i}get sink(){return this.#c}addEventListener(t,e,r){t=="open"&&this.readyState==this.OPEN&&e.call(this,new Event("open")),super.addEventListener(t,e,r)}send(t){if(this.#d)throw new Error("Cannot enqueue or send data on a freed connection");this.#a!=this.OPEN?this.#h.push(t):this.#c?.desiredSize<0||this.#l.length?(this.#l.push(t),this.#c.ready.then(()=>{let e=this.#l.shift();e&&this.#c.write(e)})):this.#c.write(t)}async connect(){if(this.#d)throw new Error("Cannot restart a freed connection");if(this.#a<this.CLOSING){console.debug(`${this.#e.toUpperCase()} connection is already open.`);return}switch(this.#a=this.CONNECTING,this.#e){case"tcp":{let t=await Deno.connect({hostname:this.#r,port:this.#s});this.#t=t,this.#n=t.readable,this.#i=t.readable.getReader(),this.#o=t.writable,this.#c=t.writable.getWriter();break}default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#a=this.OPEN,this.dispatchEvent(new Event("open")),(async()=>{try{let t=!0;for(;t;){let{value:e,done:r}=await this.#i.read();t=!r,e&&this.dispatchEvent(new MessageEvent("data",{data:e})),r&&this.close()}}catch(t){this.dispatchEvent(new ErrorEvent("error",{message:t.message,error:t})),this.close()}})()}close(){if(this.#a>this.OPEN){console.debug(`${this.#e.toUpperCase()} connection is already closed.`);return}switch(this.#a=this.CLOSING,this.#e){case"tcp":{let{rid:t}=this.#t;Deno.resources()[t]&&this.#t?.close();break}default:throw new Error(`Invalid protocol "${this.#e}"`)}this.#a=this.CLOSED,this.dispatchEvent(new Event("close"))}free(){return this.close(),this.#d=!0,this.#h.splice(0,this.#h.length)}constructor({proto:t,host:e,port:r},s){super(),t=t||"tcp",e=e||"127.0.0.1",r=r||80,this.#e=t,this.#r=e,this.#s=r,this.addEventListener("open",async()=>{this.#h.forEach(n=>{this.send(n)})}),this.addEventListener("close",()=>{this.#l.length&&this.#h.splice(0,0,this.#l.splice(0,this.#l.length))}),s&&this.connect()}},R=class extends EventTarget{#e;#r;#s;#t;#n;#o;#i=1;OPEN=1;CLOSING=2;CLOSED=3;get ip(){return this.#e.hostname||"0.0.0.0"}get port(){return this.#e.port||0}get readyState(){return this.#i}get source(){return this.#n}get sink(){return this.#o}send(t){this.#i==1&&this.#o.write(t)}close(){this.#i=this.CLOSING,this.#r.close(),this.#i=this.CLOSED,this.dispatchEvent(new Event("close"))}addEventListener(t,e,r){t=="open"&&this.readyState==this.OPEN&&e.call(this,new Event("open")),super.addEventListener(t,e,r)}constructor(t){super(),this.#e=t.remoteAddr,this.#r=t,this.#s=t.readable,this.#n=t.readable.getReader(),this.#t=t.writable,this.#o=t.writable.getWriter(),(async()=>{let e=!0;for(;e;){let{value:r,done:s}=await this.#n.read();e=!s,r&&this.dispatchEvent(new MessageEvent("data",{data:r})),s&&this.close()}})()}},P=class extends EventTarget{#e;#r;#s;#t;#n;#o=!1;#i=!1;get active(){return this.#o}get proto(){return this.#e}get host(){return this.#r}get port(){return this.#s}get reuse(){return this.#t}async listen(){if(this.#i)throw new Error("Cannot restart a freed connection");if(this.#o){console.debug(`${this.#e.toUpperCase()} server on ${this.#r}:${this.#s} is already active.`);return}let t=this;try{switch(this.#e){case"tcp":{t.#n=Deno.listen({hostname:t.#r,port:t.#s,reusePort:t.#t}),t.dispatchEvent(new Event("listen"));for await(let e of t.#n.accept())t.dispatchEvent(new MessageEvent("accept"),{data:new R(e)});break}default:throw t.free(),new Error(`Invalid protocol "${t.#e}"`)}}catch{this.dispatchEvent(new Event("close"))}}close(){if(!this.#o){console.debug(`${this.#e.toUpperCase()} server on ${this.#r}:${this.#s} is already closed.`);return}switch(this.#e){case"tcp":{this.#n?.close();break}}}free(){this.close(),this.#i=!0}constructor({proto:t,host:e,port:r,reuse:s},n){super(),t=t||"tcp",e=e||"0.0.0.0",r=r||8e3,this.#e=t,this.#r=e,this.#s=r,this.#t=s,this.addEventListener("listen",()=>{console.error(`WingBlade ${t.toUpperCase()} server listening on ${e}:${r}`)}),n&&this.listen()}},u,I=(u=class{},o(u,"RawClient",N),o(u,"RawServer",P),u),m=I;function D(){let t,e="pending",r=new Promise((s,n)=>{t={async resolve(i){await i,e="fulfilled",s(i)},reject(i){e="rejected",n(i)}}});return Object.defineProperty(r,"state",{get:()=>e}),Object.assign(r,t)}function M(t,e={}){let{signal:r,persistent:s}=e;return r?.aborted?Promise.reject(new DOMException("Delay was aborted.","AbortError")):new Promise((n,i)=>{let a=()=>{clearTimeout(w),i(new DOMException("Delay was aborted.","AbortError"))},w=setTimeout(()=>{r?.removeEventListener("abort",a),n()},t);if(r?.addEventListener("abort",a,{once:!0}),s===!1)try{Deno.unrefTimer(w)}catch(v){if(!(v instanceof ReferenceError))throw v;console.error("`persistent` option is only available in Deno")}})}var b=class{#e=0;#r=[];#s=[];#t=D();add(e){++this.#e,this.#n(e[Symbol.asyncIterator]())}async#n(e){try{let{value:r,done:s}=await e.next();s?--this.#e:this.#r.push({iterator:e,value:r})}catch(r){this.#s.push(r)}this.#t.resolve()}async*iterate(){for(;this.#e>0;){await this.#t;for(let e=0;e<this.#r.length;e++){let{iterator:r,value:s}=this.#r[e];yield s,this.#n(r)}if(this.#s.length){for(let e of this.#s)throw e;this.#s.length=0}this.#r.length=0,this.#t=D()}}[Symbol.asyncIterator](){return this.iterate()}},f="Server closed",q=5,F=1e3,p=class{#e;#r;#s;#t=!1;#n=new Set;#o=new AbortController;#i=new Set;#c;constructor(e){this.#e=e.port,this.#r=e.hostname,this.#s=e.handler,this.#c=e.onError??function(r){return console.error(r),new Response("Internal Server Error",{status:500})}}async serve(e){if(this.#t)throw new Deno.errors.Http(f);this.#u(e);try{return await this.#a(e)}finally{this.#f(e);try{e.close()}catch{}}}async listenAndServe(){if(this.#t)throw new Deno.errors.Http(f);let e=Deno.listen({port:this.#e??80,hostname:this.#r??"0.0.0.0",transport:"tcp"});return await this.serve(e)}async listenAndServeTls(e,r){if(this.#t)throw new Deno.errors.Http(f);let s=Deno.listenTls({port:this.#e??443,hostname:this.#r??"0.0.0.0",certFile:e,keyFile:r,transport:"tcp"});return await this.serve(s)}close(){if(this.#t)throw new Deno.errors.Http(f);this.#t=!0;for(let e of this.#n)try{e.close()}catch{}this.#n.clear(),this.#o.abort();for(let e of this.#i)this.#d(e);this.#i.clear()}get closed(){return this.#t}get addrs(){return Array.from(this.#n).map(e=>e.addr)}async#h(e,r){let s;try{if(s=await this.#s(e.request,r),s.bodyUsed&&s.body!==null)throw new TypeError("Response body already consumed.")}catch(n){s=await this.#c(n)}try{await e.respondWith(s)}catch{}}async#l(e,r){for(;!this.#t;){let s;try{s=await e.nextRequest()}catch{break}if(s===null)break;this.#h(s,r)}this.#d(e)}async#a(e){let r;for(;!this.#t;){let s;try{s=await e.accept()}catch(a){if(a instanceof Deno.errors.BadResource||a instanceof Deno.errors.InvalidData||a instanceof Deno.errors.UnexpectedEof||a instanceof Deno.errors.ConnectionReset||a instanceof Deno.errors.NotConnected){r?r*=2:r=q,r>=1e3&&(r=F);try{await M(r,{signal:this.#o.signal})}catch(h){if(!(h instanceof DOMException&&h.name==="AbortError"))throw h}continue}throw a}r=void 0;let n;try{n=Deno.serveHttp(s)}catch{continue}this.#p(n);let i={localAddr:s.localAddr,remoteAddr:s.remoteAddr};this.#l(n,i)}}#d(e){this.#w(e);try{e.close()}catch{}}#u(e){this.#n.add(e)}#f(e){this.#n.delete(e)}#p(e){this.#i.add(e)}#w(e){this.#i.delete(e)}};function j(t){return t==="0.0.0.0"?"localhost":t}async function S(t,e={}){let r=e.port??8e3,s=e.hostname??"0.0.0.0",n=new p({port:r,hostname:s,handler:t,onError:e.onError});e?.signal?.addEventListener("abort",()=>n.close(),{once:!0});let i=Deno.listen({port:r,hostname:s,transport:"tcp"}),a=n.serve(i);return r=n.addrs[0].port,"onListen"in e?e.onListen?.({port:r,hostname:s}):console.log(`Listening on http://${j(s)}:${r}/`),await a}var L='<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';let U=class{static serve(t,e={}){let r=`file://${Deno.cwd()}`;return e?.onListen||(e.onListen=function({port:s,hostname:n}){n=="0.0.0.0"&&(n="127.0.0.1"),console.error(`WingBlade serving at http://${n}:${s}`)}),e?.hostname||(e.hostname="0.0.0.0"),e?.port||(e.port=8e3),S(async(s,n)=>{try{let i=await t(s,n);return i?.constructor==Response?i:new Response(JSON.stringify(i),{headers:{"Content-Type":"text/plain"}})}catch(i){return console.error(`Request error at ${s.method} ${s.url}
${i.stack}`),new Response(L.replace("${runtime}",WingBlade.rt.variant).replace("${stackTrace}",i.stack.replaceAll(r,"wingblade:app")),{status:502,headers:{"Content-Type":"text/html"}})}},e)}static acceptWs(t,e){return Deno.upgradeWebSocket(t,e)}},C=U;let _=class{static randomInt(t){return Math.floor(Math.random()*t)}static sleep(t,e=0){return new Promise(r=>{AbortSignal.timeout(t+Math.floor(e*Math.random())).addEventListener("abort",()=>{r()})})}},O=_;let x=function(t){self.navigator||(self.navigator={});let e=navigator;switch(e.userAgent||(e.userAgent=`${t.rt.variant}/${t.rt.version}`),e.language||(e.language=null),e.languages?.constructor||(e.languages=[]),e.hardwareConcurrency||(e.hardwareConcurrency=t.rt.cores),e.deviceMemory||(e.deviceMemory=Math.min(2**Math.round(Math.log2(t.rt.memory.total/1073741824)),8)),e.permissions||(e.permissions={query:r=>t.rt.perms.querySync(r)}),t.rt.variant){case"Node":case"Bun":break;case"Deno":break}};let l,B=(l=class{},o(l,"args",Deno.args),o(l,"rt",y),o(l,"env",g),o(l,"file",E),o(l,"net",m),o(l,"web",C),o(l,"util",O),l);x(B);export{B as WingBlade};
