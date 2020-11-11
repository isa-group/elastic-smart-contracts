#!/bin/bash

echo "########### LAUNCHING THE EXPERIMENTS ###########"
./tesFrequency.sh
sleep 10
./testNoElasticity.sh
sleep 10
./testTimeWindow.sh
 echo "############ SCRIPT FINISHED ############"