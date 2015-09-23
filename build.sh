#!/usr/bin/env bash

set -e -x

babel --stage 1 -o repo-update.js < repo-update.es6.js
chmod +x repo-update.js
