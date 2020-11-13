#!/bin/bash

node enrollAdmin.js
node registerUser.js registerSensors -n $1
node registerSensors.js registerSensors -n $1