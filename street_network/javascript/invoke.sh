
#!/bin/bash


./register.sh $1 &
WA=$!
wait $WA
node listener.js launchListener -n $1 -m $2 -f $4 -t $5 &
for i in $(seq 1 1 $1)
do
    node invoke.js launchDetections -n $1 -m $2 -s $3 -j $i -d $6 &
done

