//read csv
var fs = require('fs');
const getDirName = require('path').dirname;

var counter = [];
const ESCsNumber = 4;
const experimentID = 103;

for (var t = 1; t <= ESCsNumber; t++) {
    counter.push(t)
}

var i = 0;

function readFiles(dirname) {

    return new Promise((resolve, reject) => {
        let dataAux = [];
    
        fs.readdir(dirname, function (err, filenames) {
            if (err) {
                console.log(err)
                return;
            }
            filenames.forEach(function (filename) {
                if(!filename.includes("harvest")){
                    fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                        if (err) {
                            console.log(err)
                            return;
                        }
                        let dataESC = content.split('\n');
                        dataESC.shift();
                        dataESC.pop();
                        dataESC.forEach(function (element) {
                            let dataAnalysis = element.split(',');
                            dataAux.push({timestamp:parseFloat(dataAnalysis[14]), time: parseFloat(dataAnalysis[1]),timeA:parseFloat(dataAnalysis[2]), esc: dirname.split("ans")[1].split("/")[0], window: parseFloat(dataAnalysis[4])});
                        });
                        resolve(dataAux);
                    });
                }
            });
        });
    });
}

let promises = []
counter.forEach(async function (elmnt) {
    i = elmnt;
    promises.push(readFiles('./experiments_results/' + experimentID + '/oti_gc_ans' + i + '/'));
});

Promise.all(promises).then(function (data) {
    data = data.reduce((acc, curr) => acc.concat(curr), []);
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
            timesCsvBody += element.timestamp + ",";
            counter.forEach(function (elmnt) {
                    if(element.esc == elmnt.toString()){
                        timesCsvBody += element.time + ",";
                    } else {
                        timesCsvBody += ",";
                    }
            });

            counter.forEach(function (elmnt) {
                    if(element.esc == elmnt){
                        timesCsvBody += element.timeA + ",";
                    } else {
                        timesCsvBody += ",";
                    }
            });

            counter.forEach(function (elmnt) {
                    if(element.esc == elmnt){
                        timesCsvBody += element.window + ",";
                    } else {
                        timesCsvBody += ",";
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