This guide has used Ubuntu 18.04

Note: if some of the commands given return an error, try: sudo apt update

# Usage instructions


1. Install Git if you don not have it already:

2. Download and install cURL: https://curl.haxx.se/download.html

    2.1 If you are running on mac, install wget:
  ```
  brew install wget
  ```
3. Install docker and docker-compose, 17.06.2-ce or greater is required for docker and 1.14.0 or greater for docker-compose:
  ```
  sudo apt install docker.io
  sudo apt install docker-compose
  sudo apt update
  ```
4. Install Go 1.13 or greater, in order to do so you need to run:
  ```
  sudo add-apt-repository ppa:longsleep/golang-backports
  sudo apt update
  sudo apt install golang-go
  ``` 
  4.1 Set the following environment variables:
  ```
  export GOPATH=$HOME/go
  export PATH=$PATH:$GOPATH/bin
  ``` 
5. Install Node and Npm, Node version 8 is supported from 8.9.4 and higher. Node version 10 is supported from 10.15.3 and higher. It is highly recommended to use NVM to manage node versions, check the installation at https://github.com/nvm-sh/nvm#installing-and-updating as the commands may vary with the version. This guide uses Node 8.13.0 and NPM 6.4.1

6. Make sure you have Python 2.7, if not, run:
  ```
  sudo apt-get install python
  python --version
  ```
  
7. Download the Binaries and Docker images with the following command line: 
```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.1.0 1.4.6 0.4.18
```
**This will also download the fabric samples as there is no installer available for just the Binaries and Images, for more information please check https://hyperledger-fabric.readthedocs.io/en/release-2.1/install.html**

8. Clone the repository https://github.com/isa-group/elastic-smart-contracts into the desired directory

    -8.1 Now you need to set the path to the binaries downloaded previosly (the **bin** folder), you can either run:
    ```
    export PATH=<path to bin>:$PATH
    ```
    or copy the /bin folder inside the elastic smart contracts folder you just cloned and uncomment line 15 of elastic-smart-contracts/test-network/network.sh      
    which is:
    ```
    export PATH=${PWD}/../bin:${PWD}:$PATH
    ```
    this will cause the scripts to always point to the binaries placed at elastic-smart-contracts, regardless of being in a new terminal.
    
    (bin is already in the .gitignore file but you should be careful not to upload the uncommented line of network.sh)

9. go to **elastic-smart-contracts/street-network/javascript** and run: 
```
npm install
./launchExperiments.sh
```

10. Wait for the network to start up and run the experiments! Once it is finished it will shut down itself.



# Prometheus monitoring

1. Once you have cloned the elastic smart contracts repository you can see a file named **prometheus.yml** inside a folder called **prometheus**.

2. Run the following command: 
```
docker start -i $(docker ps -a -q --filter ancestor=prom/prometheus) || docker run -p 9090:9090 -v <path to prometheus.yml>:/etc/prometheus/prometheus.yml prom/prometheus

```
This will start the prometheus container if you already have it or run it otherwise.

3. Go to http://localhost:9090/targets and check that Prometheus is up and running, you can observe now how the peer targets are down showing the error "server misbehaving", this is normal behaviour due to prometheus not being yet connected to the blockchain network.

    -3.1 The experiment scripts are programmed to connect and disconnect automatically prometheus to the network, but you can do it manually with the following                     
    commands if you wish to do so:
    ```
    docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)

    docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
    ```
    
4. Open Grafana and add a new dataSource to look like this:

5. Import the Grafana dashboard through the Json file contained within the prometheus folder.

6. Run any experiment to see the results.
