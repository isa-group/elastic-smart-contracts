#!/bin/bash


#node ./esc/street1/index.js start &
#node ./esc/street2/index.js start 

for path in $*
do
    node $path start &
done
