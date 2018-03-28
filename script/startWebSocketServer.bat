@echo off

SCRIPT_FOLDER="$(dirname $0)"

php "%SCRIPT_FOLDER%\startWebSocketServer.php"
