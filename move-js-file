#!/bin/bash
FROM_PATH=$1
TO_PATH=$2
MODULE_NAME=$3
PROJECT_APPS=${*:4}
TRANSFORMER_PATH="$(dirname $0)/move-file.js"
sudo jscodeshift -t "$TRANSFORMER_PATH" ./ --fromPath="$FROM_PATH" --toPath="$TO_PATH" --currentModuleName="$MODULE_NAME" &&
sudo jscodeshift -t "$TRANSFORMER_PATH" $PROJECT_APPS --moduleName="$MODULE_NAME" --fromPath="$FROM_PATH" --toPath="$TO_PATH"
echo "git mv $FROM_PATH $TO_PATH"
