#!/bin/bash


#node ./esc/traffic-flow-street1/index.js start &
#node ./esc/traffic-flow-street2/index.js start 

for path in $*
do
    node $path start &
done
