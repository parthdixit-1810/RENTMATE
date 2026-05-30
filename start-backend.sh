#!/bin/bash
set -a
source "$(dirname "$0")/rentmate-backend/.env"
set +a

cd "$(dirname "$0")/rentmate-backend"
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"

mvn spring-boot:run
