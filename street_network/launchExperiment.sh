
#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
./startFabric.sh javascript
docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
./register.sh $1
node listener.js launchListener -n $1 -m $2 -f $4 -t $5 -p $7 &
WR=$!
for i in $(seq 1 1 $1)
do
    node invoke.js launchDetections -n $1 -m $2 -s $3 -j $i -d $6 &
done
wait $WR
cd ..
docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
exit
