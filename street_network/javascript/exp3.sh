
#!/bin/bash


echo "#### STARTING EXPERIMENT NUMBER 3: TIME TO GET DATA FROM FOR CALCULATION INCREASED EXPONENTIALLY ###"
./register.sh 4 &
WA=$!
wait $WA
for i in $(seq 0 1 6); do                                             
    timeData=$((2**i))
    echo ======================= ITERATION NUMBER $i: $timeData seconds ======================
    ./invoke.sh  4  256  1  8  $timeData 1 exp3
    sleep 5
done
 echo "############ SCRIPT FINISHED ############"