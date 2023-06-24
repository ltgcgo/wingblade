#!/bin/bash
cd examples
all_proxy= HTTPS_PROXY= ALL_PROXY= https_proxy= HTTP_PROXY= http_proxy= NO_PROXY= no_proxy= ftp_proxy= FTP_PROXY= wrangler dev --port 8000 ../dist/app_cloudflare.js
exit