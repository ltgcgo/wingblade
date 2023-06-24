# wingblade

☁️ One codebase, multiple runtimes.

WingBlade provides an abstraction layer for targeting multiple JavaScript runtimes simultaneously, namely [Deno](https://deno.land), [Bun](https://bun.sh), [Cloudflare Workers](https://workers.cloudflare.com) and [Node.js](https://nodejs.org).

Projects utilizing WingBlade are expected to write platform-agnostic code. For the most part, unless a better measure is found, WingBlade adheres to the Deno API scheme.

The model is already present in all of our other projects targeting multiple runtimes.

Read the documentation: [https://kb.ltgc.cc/](https://kb.ltgc.cc/wingblade/)

TypeScript support is not considered.