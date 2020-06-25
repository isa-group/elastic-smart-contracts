
#!/bin/bash

cd ..
./networkDown.sh
./startFabric.sh javascript
cd javascript
./register.sh 16 
node listener.js launchListener -n $1 -m $2 -f $4 -t $5 -p $7 &
WR=$!
for i in $(seq 1 1 $1)
do
    node invoke.js launchDetections -n $1 -m $2 -s $3 -j $i -d $6 &
done
wait $WR
cd ..
./networkDown.sh
exit
