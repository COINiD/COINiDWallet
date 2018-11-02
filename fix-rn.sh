#!/bin/sh
cd node_modules/react-native/scripts && ./ios-install-third-party.sh && cd ../../../
cd node_modules/react-native/third-party/glog-0.3.4/ && ../../scripts/ios-configure-glog.sh && cd ../../../../
rm node_modules/react-native/third-party/glog-0.3.4/test_driver
rm node_modules/react-native/scripts/third-party/glog-0.3.4/test-driver