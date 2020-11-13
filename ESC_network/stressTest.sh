
#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
./startFabric.sh javascript
docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
./register.sh 48
node analysisManager.js launchListener -n 16 -m 128 -f 8 -t 32 -p stressTest &
WR=$!
sleep 1
for i in $(seq 1 1 16)
do
    node harvestingManager.js launchDetections -n 16 -m 128 -s 1 -j $i -t 32 -d 1 &
done

wait $WR
sleep 10

node analysisManager.js launchListener -n 32 -m 128 -f 8 -t 32 -p stressTest &
WR=$!
sleep 1
for i in $(seq 1 1 32)
do
    node harvestingManager.js launchDetections -n 32 -m 128 -s 1 -j $i -t 32 -d 1 &
done

wait $WR
sleep 10
node analysisManager.js launchListener -n 48 -m 128 -f 8 -t 32 -p stressTest &
WR=$!
sleep 1
for i in $(seq 1 1 48)
do
    node harvestingManager.js launchDetections -n 48 -m 128 -s 1 -j $i -t 32 -d 1 &
done

wait $WR
sleep 10
node analysisManager.js launchListener -n 32 -m 128 -f 8 -t 32 -p stressTest &
WR=$!
sleep 1
for i in $(seq 1 1 32)
do
    node harvestingManager.js launchDetections -n 32 -m 128 -s 1 -j $i -t 32 -d 1 &
done

wait $WR
sleep 10
node analysisManager.js launchListener -n 16 -m 128 -f 8 -t 32 -p stressTest &
WR=$!
sleep 1
for i in $(seq 1 1 16)
do
    node harvestingManager.js launchDetections -n 16 -m 128 -s 1 -j $i -t 32 -d 1 &
done

wait $WR
sleep 10
cd ..
docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
exit
