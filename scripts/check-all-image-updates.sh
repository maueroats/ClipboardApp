#!/bin/sh
if command -v python3 &>/dev/null; then
	pythoncmd=python3
else
	pythoncmd=python
fi

scriptpath=$(dirname $0)/check_image_updates.py

echo
echo "============================="
echo "Checking for image updates..."
$pythoncmd $scriptpath library/python 3.7.3 alpine
$pythoncmd $scriptpath library/postgres 11.4 alpine
$pythoncmd $scriptpath dpage/pgadmin4 4.8
$pythoncmd $scriptpath library/nginx 1.17 alpine
$pythoncmd $scriptpath library/nginx 1.17
$pythoncmd $scriptpath library/node 12.4 alpine
$pythoncmd $scriptpath portainer/portainer 1.20.2
echo "=============================="
echo
