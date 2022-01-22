'use strict'

module.exports.setUpAgreement = function setUpAgreement(req, res, next) {
  const fs = require('fs');
  const { exec } = require('child_process');
  require('dotenv').config()
  const directory = "./esc/"
  const file = "governify/"
  const command = "echo " + process.env.SUDOPASSWORD + " | sudo -S "

  
  function os_func() {
  this.execCommand = function (cmd) {
    return new Promise((resolve, reject)=> {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
        }
        console.log(stdout);
        resolve()
        });
    })
  }
  }
  var os = new os_func();

  const agreement = req.agreement.value

  os.execCommand(command + "./stop.sh").then(res=> {
    os.execCommand(command + "./init.sh").then(res=> {
      os.execCommand(command + "./setup.sh").then(res=> {
        os.execCommand(command + "node " + directory + file + "/index.js start " + agreement).then(resExec=> {
          res.send({
            code: 202,
            message: 'Agreement set up'
          });
        }).catch(err=> {
        })
      }).catch(err=> {
      })
    }).catch(err=> {
    })
  }).catch(err=> {
    console.log(err);
    res.send({
      code: 500,
      message: 'Server Error'
    });
  })

  // os.execCommand(command + "node " + directory + file + "/index.js start " + agreement).then(resExec=> {
  //   res.send({
  //     code: 202,
  //     message: 'Agreement set up'
  //   });
  // }).catch(err=> {
  // })
};