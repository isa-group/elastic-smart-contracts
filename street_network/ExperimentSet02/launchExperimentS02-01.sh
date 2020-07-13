
#!/bin/bash

cd ..
echo "#### STARTING EXPERIMENT NUMBER 1: NUMBER OF SENSORS INCREASED EXPONENTIALLY ###"
for i in $(seq 0 1 4); do                                             
    sensors=$((2**i))
    echo ======================= ITERATION NUMBER $i: $sensors sensors ======================
    ./launchExperiment.sh  $sensors  512  1  8  32 1 exp1
    sleep 5
done
echo "############ EXPERIMENT FINISHED ############"
cd ExperimentSet02