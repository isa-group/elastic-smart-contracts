'use strict'

module.exports.setUpAgreement = async function setUpAgreement(req, res, next) {
  const { exec } = require('child_process');
  const fse = require('fs-extra');
  const fs = require('fs');
  const path = require('path');
  require('dotenv').config()
  const file = "governify" + req.undefined.value.agreement.id
  const command = "echo " + process.env.SUDOPASSWORD + " | sudo -S "

  function os_func() {
    this.execCommand = function (cmd) {
        return new Promise((resolve, reject)=> {
            exec(cmd, (error, stdout, stderr) => {
              console.log(stdout)
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

  fse.copy(path.join(__dirname ,"../esc/governifyoti_gc_ansX"),path.join(__dirname, "../esc",file), function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.readFile(path.join(__dirname, "../esc", file, "index.js"), 'utf8', function (err2,data) {
        if (err2) {
          return console.log(err2);
        }

        const idESC = file.replace("governifyoti_gc_ans", "")

        let resultESC = data.replace(/createData"/g, "createData" + idESC + '"').
        replace(/queryDataCalculation"/g, "queryDataCalculation" + idESC + '"').
        replace(/createDataCalculation"/g, "createDataCalculation" + idESC + '"').
        replace(/updateData"/g, "updateData" + idESC + '"').
        replace(/analysis"/g, "analysis" + idESC + '"').
        replace(/evaluateHistory"/g, "evaluateHistory" + idESC + '"').
        replace(/evaluateFrequency"/g, "evaluateFrequency" + idESC + '"').
        replace(/governifyoti_gc_ansX/g, file);

        fs.writeFile(path.join(__dirname, "../esc", file, "index.js"), resultESC, 'utf8', function (err3) {
          if (err3) return console.log(err3);

          fs.readFile(path.join(__dirname, "../esc", file, "chaincode/src/index.js"), 'utf8', function (err4,data2) {
            if (err4) {
              return console.log(err4);
            }
            let esc = require(path.join(__dirname, "../esc", file, "index.js"))

            let result = data2.replace(/queryData\(/g, "queryData" + idESC + "(").
            replace(/createData\(/g, esc.config.dataStorageContract + "(").
            replace(/queryDataCalculation\(/g, esc.config.queryAnalysisHolderContract + "(").
            replace(/createDataCalculation\(/g, esc.config.calculationStorageContract + "(").
            replace(/updateData\(/g, esc.config.updateDataContract + "(").
            replace(/analysis\(/g, esc.config.analysisContract + "(").
            replace(/evaluateHistory\(/g, esc.config.evaluateWindowTimeContract + "(").
            replace(/evaluateFrequency\(/g, esc.config.evaluateHarvestFrequencyContract + "(").
            replace(/queryWithQueryString\(/g, "queryWithQueryString" + idESC + "(");

            fs.writeFile(path.join(__dirname, "../esc", file, "chaincode/src/index.js"), result, 'utf8', function (err5) {
              if (err5) return console.log(err5);
              os.execCommand(command + "./setup2.sh " + file).then(result3=> {
                console.log("Agreement set up")
                res.send({
                  code: 200,
                  message: 'Agreement set up'
                });
                let esc = require(path.join(__dirname ,"../esc", file, 'index.js'))
                esc.start(metricQueries,agreement)
              }).catch(err6=> {
                console.log(err6)
                res.send({
                  code: 500,
                  message: 'Server Error'
                });
              });
            });
          });
        });
      });
    };
  });
};