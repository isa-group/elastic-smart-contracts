#!/bin/bash

pushd ./network
for entry in ../esc/*
do
    contractName="$(node -e "require('${entry}').chaincodeName()")"
    ./init.sh deployCC -ccn ${contractName} -ccv 1 -cci initLedger -ccl "javascript"  -ccp "$entry/chaincode"
done
node ./connection/
popd
sleep 5
node ./esc_core/src
