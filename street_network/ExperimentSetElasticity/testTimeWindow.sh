
#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd ..
./networkDown.sh
./startFabric.sh javascript
docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
./register.sh 4
node listenerV2.js launchListener -n $1 -m $2 -f $3 -t $5 -p testTimeWindow --maxc $8 --minc $9 -s $7 &
WR=$!
sleep 1
for i in $(seq 1 1 4)
do
    node invokeV2.js launchDetections -n $1 -m $2 -s $7 -j $i -t $5 -d $4 --maxc $8 --minc $9 --fcc $6 -e 2 &
done

wait $WR
cd ..
docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
exit
