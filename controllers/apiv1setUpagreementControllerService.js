'use strict'

module.exports.setUpAgreement = async function setUpAgreement(req, res, next) {
  const { exec } = require('child_process');
  const fse = require('fs-extra');
  const fs = require('fs');
  const path = require('path');
  require('dotenv').config()
  const file = req.undefined.value.agreement.id

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

  const agreementName = file.replace(/[\d\.]+$/, '');

  // Create the new agreement based on the agreement template
  fse.copy(path.join(__dirname ,`../esc/${agreementName}X`),path.join(__dirname, "../esc",file), function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.readFile(path.join(__dirname, "../esc", file, "index.js"), 'utf8', function (err2,data) {
        if (err2) {
          console.log(err2);
          res.send({
            code:500,
            message: 'Server Error'
          })
        } else {

          // Modify the agreement template with the new agreement data

          const regAux = new RegExp(agreementName + "X", "g");

          const idESC = file.replace(agreementName, "")

          let resultESC = data.replace(/createData"/g, "createData" + idESC + '"').
          replace(/queryDataCalculation"/g, "queryDataCalculation" + idESC + '"').
          replace(/createDataCalculation"/g, "createDataCalculation" + idESC + '"').
          replace(/updateData"/g, "updateData" + idESC + '"').
          replace(/analysis"/g, "analysis" + idESC + '"').
          replace(/evaluateHistory"/g, "evaluateHistory" + idESC + '"').
          replace(/evaluateFrequency"/g, "evaluateFrequency" + idESC + '"').
          replace(regAux, file);

          fs.writeFile(path.join(__dirname, "../esc", file, "index.js"), resultESC, 'utf8', function (err3) {
            if (err3){
              console.log(err3);
              res.send({
                code:500,
                message: 'Server Error'
              })
            } else {
              fs.readFile(path.join(__dirname, "../esc", file, "chaincode/src/index.js"), 'utf8', function (err4,data2) {
                if (err4) {
                  console.log(err4);
                  res.send({
                    code:500,
                    message: 'Server Error'
                  })
                } else {
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
                    if (err5){
                      console.log(err5);
                      res.send({
                        code:500,
                        message: 'Server Error'
                      })
                    } else {
                      os.execCommand("./setup2.sh " + file).then(result3=> {
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
                    }
                  });
                }
              });
            }
          });
        }
      });
    };
  });
};