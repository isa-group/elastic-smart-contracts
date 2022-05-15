#!/bin/bash

curl -X POST "http://localhost:5900/api/v1/shutdown" -s -o /dev/null
curl -X POST "http://localhost:5900/api/v1/startup" -s -o /dev/null
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans1"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans2"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans3"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans4"
sleep 60
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans5"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans6"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans7"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans8"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans9"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans10"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans11"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans12"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans13"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans14"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans15"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans16"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans17"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans18"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans19"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans20"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans21"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans22"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans23"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans24"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans25"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans26"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans27"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans28"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans29"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans20"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans31"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans32"
sleep 30

curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans32"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans31"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans30"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans29"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans28"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans27"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans26"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans25"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans24"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans23"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans22"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans21"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans20"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans19"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans18"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans17"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans16"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans15"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans14"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans13"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans12"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans11"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans10"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans9"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans8"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans7"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans6"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans5"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans4"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans3"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans2"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans1"
