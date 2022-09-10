#!/bin/bash

curl -X POST "http://localhost:5900/api/v1/shutdown" -s -o /dev/null
curl -X POST "http://localhost:5900/api/v1/startup" -s -o /dev/null
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans1"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans2"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans3"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans4"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans5"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans6"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans7"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans8"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans9"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans10"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans11"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans12"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans13"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans14"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans15"
sleep 300
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans16"
sleep 3000

curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans16"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans15"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans14"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans13"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans12"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans11"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans10"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans9"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans8"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans7"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans6"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans5"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans4"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans3"
sleep 300
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans2"
sleep 1200
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans1"