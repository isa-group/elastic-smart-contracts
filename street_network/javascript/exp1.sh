
#!/bin/bash


echo "#### STARTING EXPERIMENT NUMBER 1: NUMBER OF SENSORS INCREASED EXPONENTIALLY ###"
./register.sh 64 &
WA=$!
wait $WA
for i in $(seq 0 1 6); do                                             
    sensors=$((2**i))
    echo ======================= ITERATION NUMBER $i: $sensors sensors ======================
    ./invoke.sh  $sensors  256  1  8  32 1 exp1
    sleep 5
done
 echo "############ SCRIPT FINISHED ############"