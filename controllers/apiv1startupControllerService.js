'use strict'

module.exports.startup = function startup(req, res, next) {
  const { exec } = require('child_process');
  require('dotenv').config()
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
  
      return os.execCommand(command + "./init.sh").then(result1=> {
        res.send({
          code: 200,
          message: 'Network started up'
        });
      }).catch(err=> {
        console.log(err)
        res.send({
          code: 500,
          message: 'Server Error'
        });
      })

};
