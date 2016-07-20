#!/bin/bash

# We need to install dependencies only for Docker
[[ ! -e /.dockerenv ]] && [[ ! -e /.dockerinit ]] && exit 0

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -xe

# Replace test config with docker config file
rm "$DIR/config.json"
mv "$DIR/config-ci.json $DIR/config.json"