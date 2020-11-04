
#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
./startFabric.sh javascript
docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
./register.sh 4
node listenerV2.js launchListener -n 4 -m 1800 -f 8 -t 1800 -p testFrequencyLowDensity &
WR=$!
sleep 1
for i in $(seq 1 1 4)
do
    node invokeV2.js launchDetections -n 4 -m 1800 -s 1 -j $i -t 600 -d 1 --maxc 100 --minc 50 --fcc 5 -e 3 &
done

wait $WR
cd ..
docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
./networkDown.sh
exit
