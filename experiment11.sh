#!/bin/bash

curl -X POST "http://localhost:5900/api/v1/shutdown" -s -o /dev/null
curl -X POST "http://localhost:5900/api/v1/startup" -s -o /dev/null
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans"
sleep 60
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans2"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans3"
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans4"
sleep 30

curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans4"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans3"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans2"
sleep 30
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans"
