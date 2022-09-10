# Usage

Please read the [Setup Guide](setup.md) first and install all necessary components first.


We assume all ESC are properly configured inside the ```./esc``` folder. By default the repo has a pre-configured showcase scenario with three different ESC that develop analytics over a street flow and identify the appropriate parameters for an intersection stoplight policy.

Once all the parameters have been configured for each of the ESC, we need to execute the following command in the root of the repository:
```
npm start
```

Then, in order to startup the network, we need to make a POST request to the following endpoint:
```
/api/v1/startup
```

Once the network is up, if we want to setup an ESC, we need to make a POST request with the ESC data as body to the following endpoint:
```
/api/v1/setUp/XXX
```
Where ```XXX``` is the agreementID that will be used to identify the ESC.

If we want to stop the ESC, we need to make a DELETE request to the following endpoint:
```
/api/v1/stop/XXX
```
Where ```XXX``` is the agreementID.

Whenever you want to bring the network down, make a POST request to the following endpoint:

```
/api/v1/shutdown
```
