# Usage instructions

1. Check and install the necessary prerequisites in your system through this link: https://hyperledger-fabric.readthedocs.io/en/release-2.1/prereqs.html

2. Download the Binaries and Docker images with the following command line: 
```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.1.0 1.4.6 0.4.20
```
**This will also download the fabric samples as there is no installer available for just the Binaries and Images, for more information please check https://hyperledger-fabric.readthedocs.io/en/release-2.1/install.html**

3. Clone the repository https://github.com/isa-group/elastic-smart-contracts into the wanted directory

4. go to **elastic-smart-contracts/street-network/javascript** and run the script: 
```
./launchExperiments.sh
```

5. Wait for the network to start up and run the experiments! Once it is finished it will shut down itself.
