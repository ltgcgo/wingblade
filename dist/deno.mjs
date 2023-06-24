var O=Object.defineProperty;var T=(t,e,r)=>e in t?O(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var i=(t,e,r)=>(T(t,typeof e!="symbol"?e+"":e,r),r);var l,g=(l=class{static get memUsed(){return Deno.memoryUsage()}static exit(t=0){Deno.exit(t)}},i(l,"os",Deno.build.os),i(l,"variant","Deno"),i(l,"version",Deno.version.deno),i(l,"persist",!0),i(l,"networkDefer",!1),l),d="delete,get,has,set,toObject".split(","),v=new Proxy({get:(t,e)=>Deno.env.get(t)||e,set:(t,e)=>{Deno.env.set(t,e)},delete:t=>{Deno.env.delete(t)},has:t=>Deno.env.has(t),toObject:()=>Deno.env.toObject()},{get:(t,e)=>d.indexOf(e)<0&&e.constructor==String?t.get(e):t[e],set:(t,e,r)=>{if(d.indexOf(e)<0)if(e.constructor==String)t.set(e,r);else throw new TypeError("Invalid type for key");else throw new Error("Tried to write protected properties")},has:(t,e)=>d.indexOf(e)<0?e.constructor==String?t.has(e):t[e]!=null:!1,deleteProperty:(t,e)=>{if(d.indexOf(e)<0)if(e.constructor==String)t.delete(e);else throw new TypeError("Invalid type for key");else throw new Error("Tried to delete protected properties")}});var A=class{static async read(t,e){return await Deno.readFile(t,e)}static async write(t,e,r){await Deno.writeFile(t,e,r)}},m=A;var $=class extends EventTarget{#e;#r;#s;#t;#o;#d;#l;#i;#c=[];#a=[];#n=3;#h=!1;CONNECTING=0;OPEN=1;CLOSING=2;CLOSED=3;get protocol(){return this.#e}get hostname(){return this.#r}get port(){return this.#s}get readyState(){return this.#n}get source(){return this.#l}get sink(){return this.#i}addEventListener(t,e,r){t=="open"&&this.readyState==this.OPEN&&e.call(this,new Event("open")),super.addEventListener(t,e,r)}send(t){if(this.#h)throw new Error("Cannot enqueue or send data on a freed connection");this.#n!=1?this.#c.push(t):this.#i?.desiredSize<0||this.#a.length?(this.#a.push(t),this.#i.ready.then(()=>{let e=this.#a.shift();e&&this.#i.write(e)})):this.#i.write(t)}async connect(){if(this.#h)throw new Error("Cannot restart a freed connection");switch(this.#n<this.CLOSING&&console.debug(`${this.#e.toUpperCase()} connection is already open.`),this.#n=this.CONNECTING,this.#e){case"tcp":break;default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#n=this.OPEN}close(){switch(this.#n>this.OPEN&&console.debug(`${this.#e.toUpperCase()} connection is already closed.`),this.#n=this.CLOSING,this.#e){case"tcp":break;default:throw this.free(),new Error(`Invalid protocol "${this.#e}"`)}this.#n=this.CLOSED}free(){return this.close(),this.#h=!0,this.#c.splice(0,this.#c.length)}constructor({proto:t,host:e,port:r},s){super(),t=t||"tcp",e=e||"127.0.0.1",r=r||80,this.#e=t,this.#r=e,this.#s=r,this.addEventListener("open",async()=>{this.#c.forEach(n=>{this.send(n)})}),this.addEventListener("close",()=>{this.#a.length&&this.#c.splice(0,0,this.#a.splice(0,this.#a.length))}),s&&this.connect()}},u,N=(u=class{},i(u,"RawConnection",$),u),E=N;function D(){let t,e="pending",r=new Promise((s,n)=>{t={async resolve(o){await o,e="fulfilled",s(o)},reject(o){e="rejected",n(o)}}});return Object.defineProperty(r,"state",{get:()=>e}),Object.assign(r,t)}function R(t,e={}){let{signal:r,persistent:s}=e;return r?.aborted?Promise.reject(new DOMException("Delay was aborted.","AbortError")):new Promise((n,o)=>{let a=()=>{clearTimeout(w),o(new DOMException("Delay was aborted.","AbortError"))},w=setTimeout(()=>{r?.removeEventListener("abort",a),n()},t);if(r?.addEventListener("abort",a,{once:!0}),s===!1)try{Deno.unrefTimer(w)}catch(y){if(!(y instanceof ReferenceError))throw y;console.error("`persistent` option is only available in Deno")}})}var b=class{#e=0;#r=[];#s=[];#t=D();add(e){++this.#e,this.#o(e[Symbol.asyncIterator]())}async#o(e){try{let{value:r,done:s}=await e.next();s?--this.#e:this.#r.push({iterator:e,value:r})}catch(r){this.#s.push(r)}this.#t.resolve()}async*iterate(){for(;this.#e>0;){await this.#t;for(let e=0;e<this.#r.length;e++){let{iterator:r,value:s}=this.#r[e];yield s,this.#o(r)}if(this.#s.length){for(let e of this.#s)throw e;this.#s.length=0}this.#r.length=0,this.#t=D()}}[Symbol.asyncIterator](){return this.iterate()}},f="Server closed",k=5,P=1e3,p=class{#e;#r;#s;#t=!1;#o=new Set;#d=new AbortController;#l=new Set;#i;constructor(e){this.#e=e.port,this.#r=e.hostname,this.#s=e.handler,this.#i=e.onError??function(r){return console.error(r),new Response("Internal Server Error",{status:500})}}async serve(e){if(this.#t)throw new Deno.errors.Http(f);this.#f(e);try{return await this.#n(e)}finally{this.#u(e);try{e.close()}catch{}}}async listenAndServe(){if(this.#t)throw new Deno.errors.Http(f);let e=Deno.listen({port:this.#e??80,hostname:this.#r??"0.0.0.0",transport:"tcp"});return await this.serve(e)}async listenAndServeTls(e,r){if(this.#t)throw new Deno.errors.Http(f);let s=Deno.listenTls({port:this.#e??443,hostname:this.#r??"0.0.0.0",certFile:e,keyFile:r,transport:"tcp"});return await this.serve(s)}close(){if(this.#t)throw new Deno.errors.Http(f);this.#t=!0;for(let e of this.#o)try{e.close()}catch{}this.#o.clear(),this.#d.abort();for(let e of this.#l)this.#h(e);this.#l.clear()}get closed(){return this.#t}get addrs(){return Array.from(this.#o).map(e=>e.addr)}async#c(e,r){let s;try{if(s=await this.#s(e.request,r),s.bodyUsed&&s.body!==null)throw new TypeError("Response body already consumed.")}catch(n){s=await this.#i(n)}try{await e.respondWith(s)}catch{}}async#a(e,r){for(;!this.#t;){let s;try{s=await e.nextRequest()}catch{break}if(s===null)break;this.#c(s,r)}this.#h(e)}async#n(e){let r;for(;!this.#t;){let s;try{s=await e.accept()}catch(a){if(a instanceof Deno.errors.BadResource||a instanceof Deno.errors.InvalidData||a instanceof Deno.errors.UnexpectedEof||a instanceof Deno.errors.ConnectionReset||a instanceof Deno.errors.NotConnected){r?r*=2:r=k,r>=1e3&&(r=P);try{await R(r,{signal:this.#d.signal})}catch(h){if(!(h instanceof DOMException&&h.name==="AbortError"))throw h}continue}throw a}r=void 0;let n;try{n=Deno.serveHttp(s)}catch{continue}this.#p(n);let o={localAddr:s.localAddr,remoteAddr:s.remoteAddr};this.#a(n,o)}}#h(e){this.#w(e);try{e.close()}catch{}}#f(e){this.#o.add(e)}#u(e){this.#o.delete(e)}#p(e){this.#l.add(e)}#w(e){this.#l.delete(e)}};function I(t){return t==="0.0.0.0"?"localhost":t}async function C(t,e={}){let r=e.port??8e3,s=e.hostname??"0.0.0.0",n=new p({port:r,hostname:s,handler:t,onError:e.onError});e?.signal?.addEventListener("abort",()=>n.close(),{once:!0});let o=Deno.listen({port:r,hostname:s,transport:"tcp"}),a=n.serve(o);return r=n.addrs[0].port,"onListen"in e?e.onListen?.({port:r,hostname:s}):console.log(`Listening on http://${I(s)}:${r}/`),await a}var L='<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error on ${runtime}.</p><pre>${stackTrace}</pre></div></body>\n';var B=class{static serve(t,e={}){let r=`file://${Deno.cwd()}`;return e?.onListen||(e.onListen=function({port:s,hostname:n}){n=="0.0.0.0"&&(n="127.0.0.1"),console.error(`WingBlade serving at http://${n}:${s}`)}),e?.hostname||(e.hostname="0.0.0.0"),e?.port||(e.port=8e3),C(async(s,n)=>{try{let o=await t(s,n);return o?.constructor==Response?o:new Response(JSON.stringify(o),{headers:{"Content-Type":"text/plain"}})}catch(o){return console.error(`Request error at ${s.method} ${s.url}
${o.stack}`),new Response(L.replace("${runtime}",WingBlade.rt.variant).replace("${stackTrace}",o.stack.replaceAll(r,"wingblade:app")),{status:502,headers:{"Content-Type":"text/html"}})}},e)}static acceptWs(t,e){return Deno.upgradeWebSocket(t,e)}},x=B;var H=class{static randomInt(t){return Math.floor(Math.random()*t)}static sleep(t,e=0){return new Promise(r=>{AbortSignal.timeout(t+Math.floor(e*Math.random())).addEventListener("abort",()=>{r()})})}},S=H;var c,ce=(c=class{},i(c,"args",Deno.args),i(c,"rt",g),i(c,"env",v),i(c,"file",m),i(c,"net",E),i(c,"web",x),i(c,"util",S),c);export{ce as WingBlade};
