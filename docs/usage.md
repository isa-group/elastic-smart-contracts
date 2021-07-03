# Usage

Please read the [Setup Guide](setup.md) first and install all necessary components first.


We assume all ESC are properly configured inside the ```./esc``` folder. By default the repo has a pre-configured showcase scenario with three different ESC that develop analytics over a street flow and identify the appropriate parameters for an intersection stoplight policy.

Once all the parameters have been configured for each of the ESC, we need to execute this scripts in order located in the root of the repository:
```
./init.sh
./setup.sh
```
Then execute the following script with the path of every ESC you want to execute in parallel, for instance, in our showcase:

```
./start.sh ./esc/street1/index.js ./esc/street2/index.js ./esc/intersection/index.js
```

Whenever you want to bring the network down once the ESCs have finished, execute:

```
./stop.sh
```
