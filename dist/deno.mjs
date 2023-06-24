var A=Object.defineProperty;var S=(t,e,r)=>e in t?A(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var i=(t,e,r)=>(S(t,typeof e!="symbol"?e+"":e,r),r);var l,y=(l=class{static get memUsed(){return Deno.memoryUsage()}static exit(t=0){Deno.exit(t)}},i(l,"os",Deno.build.os),i(l,"variant","Deno"),i(l,"version",Deno.version.deno),i(l,"persist",!0),i(l,"networkDefer",!1),l),d="delete,get,has,set,toObject".split(","),m=new Proxy({get:(t,e)=>Deno.env.get(t)||e,set:(t,e)=>{Deno.env.set(t,e)},delete:t=>{Deno.env.delete(t)},has:t=>Deno.env.has(t),toObject:()=>Deno.env.toObject()},{get:(t,e)=>d.indexOf(e)<0&&e.constructor==String?t.get(e):t[e],set:(t,e,r)=>{if(d.indexOf(e)<0)if(e.constructor==String)t.set(e,r);else throw new TypeError("Invalid type for key");else throw new Error("Tried to write protected properties")},has:(t,e)=>d.indexOf(e)<0?e.constructor==String?t.has(e):t[e]!=null:!1,deleteProperty:(t,e)=>{if(d.indexOf(e)<0)if(e.constructor==String)t.delete(e);else throw new TypeError("Invalid type for key");else throw new Error("Tried to delete protected properties")}});var C=class{static async read(t,e){return await Deno.readFile(t,e)}static async write(t,e,r){await Deno.writeFile(t,e,r)}},v=C;var O=class{},g=O;function D(){let t,e="pending",r=new Promise((n,s)=>{t={async resolve(o){await o,e="fulfilled",n(o)},reject(o){e="rejected",s(o)}}});return Object.defineProperty(r,"state",{get:()=>e}),Object.assign(r,t)}function R(t,e={}){let{signal:r,persistent:n}=e;return r?.aborted?Promise.reject(new DOMException("Delay was aborted.","AbortError")):new Promise((s,o)=>{let a=()=>{clearTimeout(p),o(new DOMException("Delay was aborted.","AbortError"))},p=setTimeout(()=>{r?.removeEventListener("abort",a),s()},t);if(r?.addEventListener("abort",a,{once:!0}),n===!1)try{Deno.unrefTimer(p)}catch(w){if(!(w instanceof ReferenceError))throw w;console.error("`persistent` option is only available in Deno")}})}var b=class{#n=0;#t=[];#s=[];#e=D();add(e){++this.#n,this.#r(e[Symbol.asyncIterator]())}async#r(e){try{let{value:r,done:n}=await e.next();n?--this.#n:this.#t.push({iterator:e,value:r})}catch(r){this.#s.push(r)}this.#e.resolve()}async*iterate(){for(;this.#n>0;){await this.#e;for(let e=0;e<this.#t.length;e++){let{iterator:r,value:n}=this.#t[e];yield n,this.#r(r)}if(this.#s.length){for(let e of this.#s)throw e;this.#s.length=0}this.#t.length=0,this.#e=D()}}[Symbol.asyncIterator](){return this.iterate()}},f="Server closed",F=5,k=1e3,u=class{#n;#t;#s;#e=!1;#r=new Set;#i=new AbortController;#o=new Set;#a;constructor(e){this.#n=e.port,this.#t=e.hostname,this.#s=e.handler,this.#a=e.onError??function(r){return console.error(r),new Response("Internal Server Error",{status:500})}}async serve(e){if(this.#e)throw new Deno.errors.Http(f);this.#f(e);try{return await this.#d(e)}finally{this.#u(e);try{e.close()}catch{}}}async listenAndServe(){if(this.#e)throw new Deno.errors.Http(f);let e=Deno.listen({port:this.#n??80,hostname:this.#t??"0.0.0.0",transport:"tcp"});return await this.serve(e)}async listenAndServeTls(e,r){if(this.#e)throw new Deno.errors.Http(f);let n=Deno.listenTls({port:this.#n??443,hostname:this.#t??"0.0.0.0",certFile:e,keyFile:r,transport:"tcp"});return await this.serve(n)}close(){if(this.#e)throw new Deno.errors.Http(f);this.#e=!0;for(let e of this.#r)try{e.close()}catch{}this.#r.clear(),this.#i.abort();for(let e of this.#o)this.#c(e);this.#o.clear()}get closed(){return this.#e}get addrs(){return Array.from(this.#r).map(e=>e.addr)}async#l(e,r){let n;try{if(n=await this.#s(e.request,r),n.bodyUsed&&n.body!==null)throw new TypeError("Response body already consumed.")}catch(s){n=await this.#a(s)}try{await e.respondWith(n)}catch{}}async#h(e,r){for(;!this.#e;){let n;try{n=await e.nextRequest()}catch{break}if(n===null)break;this.#l(n,r)}this.#c(e)}async#d(e){let r;for(;!this.#e;){let n;try{n=await e.accept()}catch(a){if(a instanceof Deno.errors.BadResource||a instanceof Deno.errors.InvalidData||a instanceof Deno.errors.UnexpectedEof||a instanceof Deno.errors.ConnectionReset||a instanceof Deno.errors.NotConnected){r?r*=2:r=F,r>=1e3&&(r=k);try{await R(r,{signal:this.#i.signal})}catch(h){if(!(h instanceof DOMException&&h.name==="AbortError"))throw h}continue}throw a}r=void 0;let s;try{s=Deno.serveHttp(n)}catch{continue}this.#p(s);let o={localAddr:n.localAddr,remoteAddr:n.remoteAddr};this.#h(s,o)}}#c(e){this.#w(e);try{e.close()}catch{}}#f(e){this.#r.add(e)}#u(e){this.#r.delete(e)}#p(e){this.#o.add(e)}#w(e){this.#o.delete(e)}};function P(t){return t==="0.0.0.0"?"localhost":t}async function E(t,e={}){let r=e.port??8e3,n=e.hostname??"0.0.0.0",s=new u({port:r,hostname:n,handler:t,onError:e.onError});e?.signal?.addEventListener("abort",()=>s.close(),{once:!0});let o=Deno.listen({port:r,hostname:n,transport:"tcp"}),a=s.serve(o);return r=s.addrs[0].port,"onListen"in e?e.onListen?.({port:r,hostname:n}):console.log(`Listening on http://${P(n)}:${r}/`),await a}var x='<!DOCTYPE html><head><meta charset="utf-8"/><title>WingBlade error</title><style>body{background:#000;color:#ccc;}</style></head><body><div style="width:75vw;min-width:360px;max-width:1080px;margin:0 auto;"><p>WingBlade has encountered an error.</p><pre>${stackTrace}</pre></div></body>\n';var j=class{static serve(t,e={}){let r=`file://${Deno.cwd()}`;return e?.onListen||(e.onListen=function({port:n,hostname:s}){s=="0.0.0.0"&&(s="127.0.0.1"),console.error(`WingBlade serving at http://${s}:${n}`)}),e?.hostname||(e.hostname="0.0.0.0"),e?.port||(e.port=8e3),E(async(n,s)=>{try{let o=await t(n,s);return o?.constructor==Response?o:new Response(JSON.stringify(o),{headers:{"Content-Type":"application/json"}})}catch(o){return console.error(`Request error at ${n.method} ${n.url}
${o.stack}`),new Response(x.replace("${stackTrace}",o.stack.replaceAll(r,"wingblade:app")),{status:502,headers:{"Content-Type":"text/html"}})}},e)}static acceptWs(t,e){return Deno.upgradeWebSocket(t,e)}},T=j;var B=class{static randomInt(t){return Math.floor(Math.random()*t)}static sleep(t,e=0){return new Promise(r=>{AbortSignal.timeout(t+Math.floor(e*Math.random())).addEventListener("abort",()=>{r()})})}},L=B;var c,se=(c=class{},i(c,"args",Deno.args),i(c,"rt",y),i(c,"env",m),i(c,"file",v),i(c,"net",g),i(c,"web",T),i(c,"util",L),c);export{se as WingBlade};