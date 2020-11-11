#!/bin/bash

echo "########### LAUNCHING THE EXPERIMENTS ###########"
./testFrequency.sh
sleep 10
./testNoElasticity.sh
sleep 10
./testTimeWindow.sh
 echo "############ SCRIPT FINISHED ############"