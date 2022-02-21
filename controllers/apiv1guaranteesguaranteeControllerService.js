'use strict'

module.exports.guarantee = async function guarantee(req, res, next) {
  try {
    const { Gateway, Wallets } = require('fabric-network');
    const path = require('path');
    const fs = require('fs');

    const ccpPath = path.resolve(__dirname,   '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    console.log(`ccpPath path: ${ccpPath}`)
    // Create a new file system based wallet for managing identities.
    const walletPath = path.resolve(__dirname, '..', 'esc_core', 'wallet');
    console.log(walletPath)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get('admin');
    if (!identity) {
        console.log('An identity for the user "admin" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }


    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('escchannel');
    let contract = network.getContract('governify');
    //Hacer evaluateTransaction en vez del submit para hacer queries, el submit es mas para escribir
    // var result = await contract.evaluateTransaction('queryData',1);
    // console.log(result.toString())
    var result = await contract.evaluateTransaction('queryDataCalculation',1);
    const responses = JSON.parse(result.toString())
    const guaranteesStates = responses[0].Record.responses[0]
    let guaranteeState = guaranteesStates.find( (g) => {
      return g.guarantee.toLowerCase() == req.guarantee.value.toLowerCase()
    })

    res.send({
      code: 200,
      guaranteeState: guaranteeState,
      message: 'Guarantee states returned'
    });
  } catch {
    res.send({
      code: 500,
      message: 'Server Error'
    });
  }
};
