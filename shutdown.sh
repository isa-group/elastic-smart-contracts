#!/bin/bash
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)


# clean out any old identites in the wallets
rm -rf esc_core/wallet/*

# shut down network
pushd ./network
./init.sh down

popd

cat <<EOF

Shut down...

EOF
