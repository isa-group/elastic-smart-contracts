'use strict'

module.exports.setUpAgreement = async function setUpAgreement(req, res, next) {
  const { exec } = require('child_process');
  require('dotenv').config()
  const file = "governify" + req.undefined.value.agreement.id
  const command = "echo " + process.env.SUDOPASSWORD + " | sudo -S "
  const esc = require("../esc/" + file + '/index.js')
  
  function os_func() {
    this.execCommand = function (cmd) {
        return new Promise((resolve, reject)=> {
            exec(cmd, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            resolve()
            });
        })
    }
  }
  var os = new os_func();

  const dt = req;
  const agreement = dt.undefined.value.agreement
  const metricQueries = dt.undefined.value.metricQueries;

  os.execCommand(command + "./setup2.sh " + file).then(result=> {
    console.log("Agreement set up")
    res.send({
      code: 200,
      message: 'Agreement set up'
    });
    esc.start(metricQueries,agreement)
  }).catch(err=> {
    res.send({
      code: 500,
      message: 'Server Error'
    });
  })

};