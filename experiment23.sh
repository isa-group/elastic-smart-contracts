#!/bin/bash

curl -X POST "http://localhost:5900/api/v1/shutdown" -s -o /dev/null
curl -X POST "http://localhost:5900/api/v1/startup" -s -o /dev/null
sleep 30
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans1"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans2"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans3"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans4"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans5"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans6"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans7"
curl "http://localhost:5400/api/v6/setUpAccountableRegistry/oti_gc_ans8"
sleep 1200

curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans8"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans7"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans6"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans5"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans4"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans3"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans2"
curl -X DELETE "http://localhost:5900/api/v1/stop/oti_gc_ans1"
