#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && [[ ! -e /.dockerinit ]] && exit 0

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -xe

# Install sqlite3
apt-get update -yqq
apt-get install sqlite3 libsqlite3-dev -yqq

# Replace test config with docker config file
mv "$DIR/config-ci.json" "$DIR/config.json"