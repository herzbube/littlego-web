@echo off

set SCRIPT_FOLDER=%~dp0
set HTDOCS_FOLDER=%SCRIPT_FOLDER%\..\src\htdocs

cd "%HTDOCS_FOLDER%"
php -S localhost:8000
