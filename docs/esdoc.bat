@echo off
cd /D "%~dp0/.."
REM using "call" to make pause work
call esdoc . -c ./docs/esdoc.json
REM pause