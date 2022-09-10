'use strict'

module.exports.guarantee = async function guarantee(req, res, next) {
  try {
    const { Gateway, Wallets } = require('fabric-network');
    const path = require('path');
    const fs = require('fs');
    const governify = require('governify-commons');
    const logger = governify.getLogger().tag('index');

    const ccpPath = path.resolve(__dirname,   '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    logger.info(`ccpPath path: ${ccpPath}`)
    // Create a new file system based wallet for managing identities.
    const walletPath = path.resolve(__dirname, '..', 'esc_core', 'wallet');
    logger.info(walletPath)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    logger.info(`Wallet path: ${walletPath}`);
    // Check to see if we've already enrolled the user.
    const identity = await wallet.get('admin');
    if (!identity) {
        logger.error('An identity for the user "admin" does not exist in the wallet');
        logger.error('Run the registerUser.js application before retrying');
        return;
    }


    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('escchannel');
    const agreement = req.agreement.value
    let aux = agreement
    let aux2 = ""
    // Agreement fitted to the contract name, this should be changed in the future
    if (agreement === "oti_gc_ans") {
      aux2 = "queryDataCalculation"
    }else if(agreement === "oti_gc_ans1"){
      aux2 = "queryDataCalculation1"
    }else{
      aux2 = "queryDataCalculation2"
    }
    let contract = network.getContract(aux);
    // In order to make a query, we need to use evaluateTransaction instead of submitTransaction
    // var result = await contract.evaluateTransaction('queryData',1);
    // console.log(result.toString())
    var result = await contract.evaluateTransaction(aux2,1);
    const responses = JSON.parse(result.toString())
    const guaranteesStates = responses[0].Record.responses[0]

    res.send({
      code: 200,
      guaranteeState: guaranteesStates[req.guarantee.value],
      message: 'Guarantee states returned'
    });
  } catch {
    res.send({
      code: 500,
      message: 'Server Error'
    });
  }
};
