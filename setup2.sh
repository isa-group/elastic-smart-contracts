#!/bin/bash
pushd ./network
contractName="$(node -e "require('../esc/${1}').chaincodeName()")"
./init.sh deployCC -ccn ${contractName} -ccv 1 -cci initLedger -ccl "javascript"  -ccp "../esc/$1/chaincode"
node ./connection/
popd
sleep 5
node ./esc_core/src $1
