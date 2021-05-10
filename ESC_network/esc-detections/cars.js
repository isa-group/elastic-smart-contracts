
const yargs = require('yargs');
const csv = require('csvtojson');
const fs = require('fs');
const randomNormal = require('random-normal');
const { timeEnd } = require('console');

let velocities = [];


const argv2 = yargs
    .command('generateCars', 'Generate detections during the given time', {
        minFlow: {
            description: 'minimum cars per second',
            alias: 'n',
            type: 'number',
        },
        maxFlow: {
            description: 'maximum cars per second',
            alias: 'm',
            type: 'number',
        },
        time: {
            description: 'seconds of execution',
            alias: 't',
            type: 'number',
        }
      }
    )
.help().alias('help', 'h').argv;

if (argv2._.includes('generateCars')) {

    let carsPerSecond = (argv2.minFlow+argv2.maxFlow)/2;

    let csvBody = "VELOCITY,TIME_START\n";

    if (carsPerSecond > 6){
        carsPerSecond = 6;
    }

    let numberCars = parseInt(carsPerSecond*(argv2.time+72));
    console.log(numberCars)

    while (velocities.length < numberCars) {
    
        let n = randomNormal({mean: 51, dev: 20});
        if(n>=30 && n<=70){
            velocities.push(parseInt(n));
        }
    
    }
    for(i = 0; i < numberCars; i++){
        csvBody += velocities[i] + "," + (((i/numberCars) * numberCars*1000) - 72000).toFixed(0)+"\n";
    }
    fs.writeFileSync('./cars6.csv', csvBody,'utf8');
}

const argv = yargs
    .command('generateCarsVariableDensity', 'Generate detections during the given time', {
        minFlow: {
            description: 'minimum cars per second',
            alias: 'n',
            type: 'number',
        },
        maxFlow: {
            description: 'maximum cars per second',
            alias: 'm',
            type: 'number',
        },
        time: {
            description: 'seconds of execution',
            alias: 't',
            type: 'number',
        }
      }
    )
.help().alias('help', 'h').argv;
if (argv._.includes('generateCarsVariableDensity')) {

    let carsPerSecond = (argv.minFlow+argv.maxFlow)/2;

    let csvBody = "VELOCITY,TIME_START\n";

    if (carsPerSecond > 6){
        carsPerSecond = 6;
    }

    let numberCars = parseInt(carsPerSecond*(argv.time+72)*5/3);
    console.log(numberCars)

    while (velocities.length < numberCars) {
    
        let n = randomNormal({mean: 51, dev: 20});
        if(n>=30 && n<=70){
            velocities.push(parseInt(n));
        }
    
    }
    for(i = 0; i < numberCars; i++){
        if(i<=parseInt(numberCars/5)){
            csvBody += velocities[i] + "," + (((i*5/numberCars) * (argv.time/3)*1000)- 72000+3454718).toFixed(0)+"\n";
        }else if(i>=parseInt(numberCars*4/5)){
            csvBody += velocities[i] + "," + (((i*5/numberCars) * (argv.time/3)*1000)- 1272000+3454718).toFixed(0)+"\n";
        }else{
            //csvBody += velocities[i] + "," + (((i*5/numberCars) * (argv.time/3)*1000)- 72000).toFixed(0)+"\n";
            csvBody += velocities[i] + "," + ((((parseInt(numberCars/5)+(i-parseInt(numberCars/5))/3)*5/numberCars) * argv.time/3*1000) - 72000+3454718).toFixed(0)+"\n";
        }
        
    }
    fs.writeFileSync('./cars6.csv', csvBody,'utf8');
}
