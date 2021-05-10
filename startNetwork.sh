#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)


# clean out any old identites in the wallets
rm -rf ESC_network/esc/wallet/*

# launch network; create channel and join peer to channel
pushd ./governify-network
./network.sh down
./network.sh up createChannel -ca -s couchdb

for entry in "../chaincode"/*
do
    contractName="$(node -e "require('${entry}/index.js').contractName()")"
    ./network.sh deployCC -ccn ${contractName} -ccv 1 -cci initLedger -ccl "javascript"  -ccp $entry
done
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

EOF
