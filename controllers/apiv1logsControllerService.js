'use strict'

module.exports.getLogs = function getLogs(req, res, next) {
  const fs = require('fs');
  const { exec } = require('child_process');
  require('dotenv').config()
  const directory = "./esc/"
  const command = "echo " + process.env.SUDOPASSWORD + " | sudo -S "


  os.execCommand(command + "./stop.sh").then(res=> {
    os.execCommand(command + "./init.sh").then(res=> {
      os.execCommand(command + "./setup.sh").then(res=> {
        fs.readdir(directory, (err, files) => {
          files.forEach(file => {
            os.execCommand(command + "node " + directory + file + "/index.js start").then(resExec=> {
            }).catch(err=> {
            })
          });
        });
        res.send({
          code: 202,
          message: 'This is the mockup controller for getContacts'
        });
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
};
