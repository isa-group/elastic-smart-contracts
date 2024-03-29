#!/bin/bash
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)

# launch network; create channel and join peer to channel
pushd ./network
./init.sh up createChannel -ca -s couchdb

popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

EOF
