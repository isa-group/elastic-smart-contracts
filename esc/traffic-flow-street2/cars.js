
const yargs = require('yargs');
const csv = require('csvtojson');
const fs = require('fs');
const randomNormal = require('random-normal');
const { timeEnd } = require('console');

let velocities = [];
let csvBody = "VELOCITY,TIME_START\n";

const argv = yargs
    .command('generateCars', 'Generate detections during the given time', {
        averageFlow: {
            description: 'average density of traffic in cars per second',
            alias: 'n',
            type: 'number',
        },
        time: {
            description: 'seconds of execution',
            alias: 't',
            type: 'number',
        },
        fileName: {
            description: 'file name',
            alias: 'f',
            type: 'string',
        },
        variable: {
            description: 'defines if the density is constant or variable',
            alias: 'v',
            type: 'boolean',
        }
      }
    )
.help().alias('help', 'h').argv;

if (argv._.includes('generateCars')) {
    generate(argv.carsPerSecond,argv.time,argv.fileName,argv.variable);
}

/**
 * This functions generates a file with traffic information.
 * @function
 * @param {number} carsPerSecond - Average number of cars per second in the street.
 * @param {number} time - time in seconds for the function to generate data.
 * @param {string} fileName - Name of the file to save the generate data to.
 * @param {boolean} variable - Set the traffic density to variable or static.
 */
async function generate(carsPerSecond, time, fileName, variable) {

    let numberCars = 0;


    if (carsPerSecond > 6){
        carsPerSecond = 6;
    }

    if(variable){
        numberCars = parseInt(carsPerSecond*(time+72)*5/3);
    }else{
        numberCars = parseInt(carsPerSecond*(argv2.time+72));
    }

    

    while (velocities.length < numberCars) {
    
        let n = randomNormal({mean: 51, dev: 20});
        if(n>=30 && n<=70){
            velocities.push(parseInt(n));
        }
    
    }
    for(i = 0; i < numberCars; i++){
        if(variable){
            if(i<=parseInt(numberCars/5)){
                csvBody += velocities[i] + "," + (((i*5/numberCars) * (time/3)*1000)- 72000+3454718).toFixed(0)+"\n";
            }else if(i>=parseInt(numberCars*4/5)){
                csvBody += velocities[i] + "," + (((i*5/numberCars) * (time/3)*1000)- 1272000+3454718).toFixed(0)+"\n";
            }else{
                csvBody += velocities[i] + "," + ((((parseInt(numberCars/5)+(i-parseInt(numberCars/5))/3)*5/numberCars) * time/3*1000) - 72000+3454718).toFixed(0)+"\n";
            }
        }else{
            csvBody += velocities[i] + "," + (((i/numberCars) * numberCars*1000) - 72000).toFixed(0)+"\n";
        }

        
    }
    fs.writeFileSync('./'+fileName+'.js', csvBody,'utf8');
}
    

