'use strict'

module.exports.shutdown = function shutdown(req, res, next) {
  const { exec } = require('child_process');
  require('dotenv').config()


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
  
    return os.execCommand("./stop.sh").then(result=> {
      res.send({
        code: 200,
        message: 'Network has been shut down'
      });
    }).catch(err=> {
      res.send({
        code: 500,
        message: 'Server Error'
      });
    })
};
