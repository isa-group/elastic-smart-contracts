
#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd ..
./networkDown.sh
./startFabric.sh javascript
docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
./register.sh 4
nodes=$1
shift 1
node analysisManager.js launchListener -n $nodes -m $1 -f $2 -t $4 -p testFrequency --maxc $7 --minc $8 -s $6 --path $9 &
WR=$!
sleep 1
for i in $(seq 1 1 4)
do
    node harvestingManager.js launchDetections -n $nodes -m $1 -s $6 -j $i -t $4 -d $3 --maxc $7 --minc $8 --fcc $5 -e 3 --path $9 &
done

wait $WR
cd ..
docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
exit
