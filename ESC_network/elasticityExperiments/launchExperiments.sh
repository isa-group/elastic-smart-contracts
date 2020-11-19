#!/bin/bash

if [ "$#" -ne 9 ]; then
    echo "ERROR: Wrong number of parameters!"
    echo "Usage: $0 <number of sensors> <execution time in seconds> <calculation frequency in seconds> <sensor update frequency in seconds> <time window in seconds> <evaluate elasticity every X calculation> <street length in kilometers> <maximum calculation time allowed in miliseconds> <minimum calculation time allowed in miliseconds>"
    echo "Example: $0 4 3600 8 1 1800 5 1 100 50"
    exit
fi
nodes=$1
shift 1
echo "########### LAUNCHING THE EXPERIMENTS ###########"
./testFrequency.sh $nodes $1 $2 $3 $4 $5 $6 $7 $8 $9
sleep 10
./testNoElasticity.sh $nodes $1 $2 $3 $4 $5 $6 $7 $8 $9
sleep 10
./testTimeWindow.sh $nodes $1 $2 $3 $4 $5 $6 $7 $8 $9
 echo "############ SCRIPT FINISHED ############"