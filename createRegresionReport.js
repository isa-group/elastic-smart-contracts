//read csv
var fs = require('fs');
const getDirName = require('path').dirname;

var data = [];
var intervals = [];
var counter = [];
const ESCsNumber = 4;
const experimentID = 69;

for (var t = 1; t <= ESCsNumber; t++) {
    counter.push(t)
}

var i = 0;

function readFiles(dirname) {

    return new Promise((resolve, reject) => {
    
        fs.readdir(dirname, function (err, filenames) {
            if (err) {
                console.log(err)
                return;
            }
            filenames.forEach(function (filename) {
                fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    let dataESC = content.split('\n');
                    dataESC.shift();
                    dataESC.pop();
                    if(dirname.includes('ans1/')){
                        dataESC.forEach(function (element) {
                            let intr = element.split(',')[7];
                            intervals.push(parseFloat(intr));
                        });
                        for (var j = 0; j < intervals.length; j++) {
                            data.push([]);
                        }
                    }
                    dataESC.forEach(function (element) {
                        let dataAnalysis = element.split(',');
                        for (var k = 0; k < intervals.length - 1 ; k++) {
                            let timeA = parseFloat(dataAnalysis[7]);
                            if(timeA >= intervals[k] && timeA < intervals[k+1]){
                                data[k].push({time: parseFloat(dataAnalysis[1]),timeA:parseFloat(dataAnalysis[2]), esc: dirname.split("ans")[1].split("/")[0], window: parseFloat(dataAnalysis[4])});
                            }
                        }
                    });

                    if(dirname.includes('ans' + ESCsNumber + '/')){
                        resolve(data);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
}

counter.forEach(async function (elmnt) {
    i = elmnt;
    let data = await readFiles('./experiments_results/' + experimentID + '/governifyoti_gc_ans' + i + '/')
    if(data){
        let timesCsvBody = "TIMESTAMP,";
        counter.forEach(function (elmnt) {
            timesCsvBody += "ESC" + elmnt + "_Time,";
        });
        counter.forEach(function (elmnt) {
            timesCsvBody += "ESC" + elmnt + "_Time_A,";
        });
        counter.forEach(function (elmnt) {
            if(elmnt != ESCsNumber){
                timesCsvBody += "ESC" + elmnt + "_Window,";
            } else {
                timesCsvBody += "ESC" + elmnt + "_Window\n";
            }
        });
        let count = 0;
        data.forEach(function (element) {
            timesCsvBody += intervals[count] + ",";
            counter.forEach(function (elmnt) {
                let cc = false;
                element.forEach(function (elmnt2) {
                    if(elmnt2.esc == elmnt.toString() && !cc){
                        cc = true;
                        timesCsvBody += elmnt2.time + ",";
                    }
                });
                if(!cc){
                    timesCsvBody += " ,";
                }
            });

            counter.forEach(function (elmnt) {
                let cc = false;
                element.forEach(function (elmnt2) {
                    if(elmnt2.esc == elmnt){
                        cc = true;
                        timesCsvBody += elmnt2.timeA + ",";
                    }
                });
                if(!cc){
                    timesCsvBody += " ,";
                }
            });

            counter.forEach(function (elmnt) {
                let cc = false;
                element.forEach(function (elmnt2) {
                    if(elmnt2.esc == elmnt){
                        cc = true;
                        timesCsvBody += elmnt2.window + ",";
                    }
                });
                if(!cc){
                    timesCsvBody += " ,";
                }
            });
            

            // if(intervals[count] && avg){
                timesCsvBody += "\n";
            //}
            count++;
        });
        let timesCsvFile = './experiments_results/' + experimentID + '/Curva_Regresion_' + new Date().toISOString().replace(/:/g, '-') + ".csv"
        fs.mkdir(getDirName(timesCsvFile), { recursive: true}, function (err) {
            if (err) logger.error(err);
            fs.writeFileSync(timesCsvFile, timesCsvBody,'utf8');
        });
    }
});