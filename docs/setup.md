# Setup

## Requirements
This guide has been developed in Ubuntu 18.04. It is recommended to update the system packages before starting the installation procedure (with: ```sudo apt update```)

## Steps
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
  
   3.1 Make sure Docker is up and running.
   
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
5. Install Node and Npm, Node version 8 is supported from 8.9.4 and higher. Node version 10 is supported from 10.15.3 and higher. It is highly recommended to use NVM to manage node versions, check the installation at https://github.com/nvm-sh/nvm#installing-and-updating as the commands may vary with the version. This guide uses Node 12.18.1 and NPM 6.14.5

6. Make sure you have Python 2.7, if not, run:
  ```
  sudo apt-get install python
  python --version
  ```
  
7. Download the Binaries and Docker images with the following command line: 
```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.3.1 1.4.9
```
**This will also download the fabric samples as there is no installer available for just the Binaries and Images, for more information please check https://hyperledger-fabric.readthedocs.io/en/release-2.3/install.html**

8. Clone the repository https://github.com/isa-group/elastic-smart-contracts into the desired directory

    -8.1 Now you need to set the path to the binaries downloaded previosly (the **bin** folder), you can either run:
    ```
    export PATH=<path to bin>:$PATH
    ```
    and comment comment line 9 of elastic-smart-contracts/network/init.sh which is:
    ```
    export PATH=${PWD}/../bin:$PATH
    ```
    or leave that line uncommented and place the bin folder in elastic-smart-contracts/bin, this line will cause the scripts to always point to the binaries placed at elastic-smart-contracts, regardless of being in a new terminal. This is the recommended setup.
    
    (bin is already in the .gitignore file but you should be careful not to upload the commented line of init.sh if you commented it)

9. Run the following command for each folder in **elastic-smart-contracts/esc/*** , **elastic-smart-contracts/esc/*/chaincode** , **elastic-smart-contracts/esc_core/** and **elastic-smart-contracts/network/connection**:

```
npm install
```

## Troubleshooting
- Do not run `npm install` in **elastic-smart-contracts/esc/**, in case you already did it, delete the file **package-lock.json**
- Make sure you have Node 12.18.1 installed in order to avoid problems with older versions.
