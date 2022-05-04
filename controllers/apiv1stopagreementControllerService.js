'use strict'

module.exports.stopAgreement = async function stopAgreement(req, res, next) {
  const fs = require('fs');
  const governify = require('governify-commons');
  const logger = governify.getLogger().tag('index');
  const file = "governify" + req.agreement.value
  try{
    const esc = require("../esc/" + file + '/index.js')
    const esc_core = require("../esc_core/index.js")
    let intervals = esc.getIntervals()
    let intervalCalculate = esc_core.intervalCalculate(file)
    let csvTimeout = esc_core.csvTimeout(file);
    if(esc.getIntervals() && esc_core.intervalCalculate(file) && esc_core.csvTimeout(file)){
      clearInterval(intervals[0])
      clearTimeout(intervals[1])
      clearInterval(intervalCalculate)
      clearInterval(csvTimeout)
      esc.stop = true
      logger.info("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
      fs.rm("esc/" + file, { recursive: true, force: true }, (err) => { if(err){console.log(err)}});
      res.send({
        code:200,
        message: 'Agreement stopped'
      })
    }else{
      res.send({
        code:500,
        message: 'Server Error'
      })
    }
  } catch (err) {
    console.log(err)
    res.send({
      code:500,
      message: 'Server Error'
    })
  }
};