#!/bin/bash
export NO_UPDATE=1
export TEMPLATE_URL=
node dist/app_node.js "$@"
exit
