
#!/bin/bash


./register.sh $1 &
WA=$!
wait $WA

for i in $(seq 1 1 $1)
do 
    node invoke.js launchDetections -n $1 -m $2 -s $i
done