#!/bin/sh
# OrionWatch — Linux/macOS ishga tushirish. © OrionSystems
cd "$(dirname "$0")" || exit 1
exec node server.js
