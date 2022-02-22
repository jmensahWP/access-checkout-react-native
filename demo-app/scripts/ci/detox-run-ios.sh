#!/bin/bash

# This script must be executed from the demo-app folder

set +e

echo "Deleting any existing test reports"
rm -f ./reports/e2e-tests/ios.html

./scripts/start-react-native-background.sh

echo "Running Detox tests for iOS"
JEST_HTML_REPORTER_OUTPUT_PATH="./reports/e2e-tests/ios-e2e-tests.html" detox test --configuration ios-ci --cleanup --loglevel verbose

./scripts/stop-react-native-background.sh
