#!/bin/bash
export NO_UPDATE=1
export TEMPLATE_URL=
deno run --allow-read --allow-write --allow-net --allow-env dist/app_deno.js "$@"
exit
