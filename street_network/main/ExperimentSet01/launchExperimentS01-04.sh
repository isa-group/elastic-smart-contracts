
#!/bin/bash

cd ..
echo "#### STARTING EXPERIMENT NUMBER 4: EXECUTION TIME INCREASED EXPONENTIALLY ###"
for i in $(seq 8 1 12); do                                             
    execTime=$((2**i))
    echo ======================= ITERATION NUMBER $i: $execTime seconds ======================
    ./launchExperiment.sh  4  $execTime  1  8  32 1 exp3
    sleep 5
done
echo "############ EXPERIMENT FINISHED ############"
cd ExperimentSet01