'use strict'

module.exports.stopAgreement = async function stopAgreement(req, res, next) {
  const fs = require('fs');
  const governify = require('governify-commons');
  const logger = governify.getLogger().tag('index');
  const getDirName = require('path').dirname;

  const file = "governify" + req.agreement.value
  try{
    const esc = require("../esc/" + file + '/index.js')
    let esc_core = require("../esc_core/index.js")
    let intervals = esc.getIntervals()
    let intervalCalculate = esc_core.intervalCalculate(file)
    let csvTimeout = esc_core.csvTimeout(file);
    let csvBody = esc_core.csvBody(file);
    let timesCsvBody = esc_core.timesCsvBody();
    let config = esc_core.config();
    let ESCnumber = esc_core.ESCnumber.counter;
    if(esc.getIntervals() && esc_core.intervalCalculate(file) && esc_core.csvTimeout(file)){
      clearInterval(intervals[0])
      clearTimeout(intervals[1])
      clearInterval(intervalCalculate)
      clearInterval(csvTimeout)
      esc.stop = true
      esc_core.ESCnumber.counter = ESCnumber - 1
      logger.info("************** EXECUTION COMPLETED, SHUTING DOWN ********************")
      const path = esc.config.resultsPath + "/ID_8_" + new Date().toISOString().replace(/:/g, '-') + ".csv"
      fs.mkdir(getDirName(path), { recursive: true}, function (err) {
        if (err) logger.error(err);
        fs.writeFileSync(path, csvBody,'utf8');
      });

      let len = Object.keys(config).length;
      let min = 100;
      let max = 0;
      let avg = 0;
      let stdev = 0;
      Object.entries(config).map(([esc,val], index, arr) =>{
          if(config[esc].execTimes.length > 0){
              let min2 = config[esc].execTimes.reduce((a,b)=> {
                  return b<a ? b : a;
              });
              if(min2 < min){
                  min = min2;
              }
              let max2 = config[esc].execTimes.reduce((a,b)=> {
                  return b>a ? b : a;
              });
              if(max2 > max){
                  max = max2;
              }
              let avg2 = config[esc].execTimes.reduce((a,b)=> {
                  return a+b;
              })/config[esc].execTimes.length;
              avg += avg2;
          }
      });
      avg = avg/ESCnumber;

      Object.entries(config).map(([esc,val], index, arr) =>{
        if(config[esc].execTimes.length > 0){
          let stdev2 = config[esc].execTimes.map((a) => {
            return ((a - avg)**2)/config[esc].execTimes.length;
          }).reduce((a,b)=> {
              return a+b;
          });
          stdev += stdev2;
        }
        config[esc].execTimes = [];
      });

      stdev = Math.sqrt(stdev/ESCnumber);

      timesCsvBody.data += min+","+max+","+avg+","+stdev+ "," + ESCnumber + "\n";

      if(esc.config.chaincodeName == "governifyoti_gc_ans1"){
        let timesCsvFile = esc.config.resultsPath +"/Info_30_" + new Date().toISOString().replace(/:/g, '-') + ".csv"
        fs.mkdir(getDirName(timesCsvFile), { recursive: true}, function (err) {
            if (err) logger.error(err);
            fs.writeFileSync(timesCsvFile, timesCsvBody.data,'utf8');
        });
      }

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