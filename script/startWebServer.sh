#!/bin/sh

SCRIPT_FOLDER="$(dirname $0)"
HTDOCS_FOLDER="$SCRIPT_FOLDER/../src/htdocs"

cd "$HTDOCS_FOLDER" && php -S localhost:8000
