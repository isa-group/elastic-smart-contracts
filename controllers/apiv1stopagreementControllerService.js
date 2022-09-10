'use strict'

module.exports.stopAgreement = async function stopAgreement(req, res, next) {
  const fs = require('fs');
  const governify = require('governify-commons');
  const logger = governify.getLogger().tag('index');
  const getDirName = require('path').dirname;

  const file = req.agreement.value
  try{
    const esc = require("../esc/" + file + '/index.js')
    let esc_core = require("../esc_core/index.js")
    let intervals = esc.getIntervals()
    let intervalCalculate = esc_core.intervalCalculate(file)
    let csvTimeout = esc_core.csvTimeout(file);
    let csvBody = esc_core.csvBody(file);
    let csvBodyHarvest = esc_core.csvBodyHarvest(file);
    let ESCnumber = esc_core.ESCnumber.counter;
    if(esc.getIntervals() && esc_core.intervalCalculate(file) && esc_core.csvTimeout(file)){
      clearInterval(intervals[0])
      clearTimeout(intervals[1])
      clearInterval(intervalCalculate)
      clearInterval(csvTimeout)
      esc.stop = true
      esc_core.ESCnumber.counter = ESCnumber - 1
      logger.info("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
      // Path of the analysis data file
      const path = esc.config.resultsPath + "/" + new Date().toISOString().replace(/:/g, '-') + ".csv"
      // Path of the harvest data file
      const pathHarvest = esc.config.resultsPath + "/" + new Date().toISOString().replace(/:/g, '-') + "_harvest.csv"
      fs.mkdir(getDirName(path), { recursive: true}, function (err) {
        if (err){
          logger.error(err);
          res.send({
            code:500,
            message: 'Server Error'
          })
        } else {
          fs.writeFileSync(path, csvBody,'utf8');
          fs.writeFileSync(pathHarvest, csvBodyHarvest,'utf8');

          // Delete the agreement
          fs.rm("esc/" + file, { recursive: true, force: true }, (err) => { 
            if(err){
              logger.error(err)
              res.send({
                code:500,
                message: 'Server Error'
              })
            } else {
              res.send({
                code:200,
                message: 'Agreement stopped'
              })
            }
          });
        }
      });

    }else{
      res.send({
        code:500,
        message: 'Server Error'
      })
    }
  } catch (err) {
    logger.error(err)
    res.send({
      code:500,
      message: 'Server Error'
    })
  }
};