//read csv
var fs = require('fs');
const getDirName = require('path').dirname;

var data = [];
var intervals = [];
var counter = [];
const ESCsNumber = 4;
const experimentID = 103;

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
                                data[k].push({data : parseFloat(dataAnalysis[1]), timeA: parseFloat(dataAnalysis[2]), windowData: parseFloat(dataAnalysis[4])});
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
    let data = await readFiles('./experiments_results/' + experimentID + '/oti_gc_ans' + i + '/')
    if(data){
        let timesCsvBody = "TIMESTAMP,MIN_TIME,MAX_TIME,MEAN_TIME,STDEV_TIME,MIN_TIME_A,MAX_TIME_A,MEAN_TIME_A,STDEV_TIME_A,MIN_WIN,MAX_WIN,MEAN_WIN,STDEV_WIN\n";
        let count = 0;
        data.forEach(function (element) {
            let min = 1000;
            let max = 0;
            let avg = 0;
            let stdev = 0;

            let minW = 10000;
            let maxW = 0;
            let avgW = 0;
            let stdevW = 0;

            let minA = 1000;
            let maxA = 0;
            let avgA = 0;
            let stdevA = 0;

            element.forEach(function (element2) {
                if(element2.data < min){
                    min = element2.data;
                }

                if(element2.data > max){
                    max = element2.data;
                }

                avg += element2.data;
                
                if(element2.windowData < minW){
                    minW = element2.windowData;
                }

                if(element2.windowData > maxW){
                    maxW = element2.windowData;
                }

                avgW += element2.windowData;

                if(element2.timeA < minA){
                    minA = element2.timeA;
                }

                if(element2.timeA > maxA){
                    maxA = element2.timeA;
                }

                avgA += element2.timeA;

            });
            avg = avg / element.length;
            avgW = avgW / element.length;
            avgA = avgA / element.length;

            element.forEach(function (element2) {
                stdev += ((element2.data - avg)**2)/element.length;
                stdevW += ((element2.windowData - avgW)**2)/element.length;
                stdevA += ((element2.timeA - avgA)**2)/element.length;
            });
            stdev = Math.sqrt(stdev);
            stdevW = Math.sqrt(stdevW);
            stdevA = Math.sqrt(stdevA);

            if(intervals[count] && avg){
                timesCsvBody += intervals[count] + "," + min+","+max+","+avg+","+stdev+ "," + minA+","+maxA+","+avgA+","+stdevA + "," + minW+","+maxW+","+avgW+","+stdevW+ "\n";
            }
            count++;
        });
        let timesCsvFile = './experiments_results/' + experimentID + '/Info_' + new Date().toISOString().replace(/:/g, '-') + ".csv"
        fs.mkdir(getDirName(timesCsvFile), { recursive: true}, function (err) {
            if (err) logger.error(err);
            fs.writeFileSync(timesCsvFile, timesCsvBody,'utf8');
        });
    }
});