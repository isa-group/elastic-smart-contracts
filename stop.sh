#!/bin/bash
#
#
# Exit on first error
set -ex

# Bring the network down
pushd ./network
./init.sh down
popd

# clean out any old identites in the wallets
rm -rf esc_core/wallet/*

