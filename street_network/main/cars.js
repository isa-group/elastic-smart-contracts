
const yargs = require('yargs');
const csv = require('csvtojson');
const fs = require('fs');
const randomNormal = require('random-normal');
const { timeEnd } = require('console');

let velocities = [];


/*const argv = yargs
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
if (argv._.includes('generateCars')) {

    let carsPerSecond = (argv.minFlow+argv.maxFlow)/2;

    let csvBody = "VELOCITY,TIME_START\n";

    if (carsPerSecond > 6){
        carsPerSecond = 6;
    }

    let numberCars = parseInt(carsPerSecond*(argv.time+72));
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
    fs.writeFileSync('./cars3.csv', csvBody,'utf8');
}*/

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
            csvBody += velocities[i] + "," + (((i*5/numberCars) * (argv.time/3)*1000)- 72000).toFixed(0)+"\n";
        }else if(i>=parseInt(numberCars*4/5)){
            csvBody += velocities[i] + "," + (((i*5/numberCars) * (argv.time/3)*1000)- 1272000).toFixed(0)+"\n";
        }else{
            //csvBody += velocities[i] + "," + (((i*5/numberCars) * (argv.time/3)*1000)- 72000).toFixed(0)+"\n";
            csvBody += velocities[i] + "," + ((((parseInt(numberCars/5)+(i-parseInt(numberCars/5))/3)*5/numberCars) * argv.time/3*1000) - 72000).toFixed(0)+"\n";
        }
        
    }
    fs.writeFileSync('./cars5.csv', csvBody,'utf8');
}

/*let interval = setInterval(() => {

    
    console.log(inde.filter((i) => {
         return (velocities[i] * (Date.now() - initialTime - timeStart[i])/3600000) >= (1*1)/3 &&
          (velocities[i] * (Date.now() - initialTime - 1000 - timeStart[i])/3600000) < (1*1)/3;
     }).length);
}, 1000);

setTimeout(() => {
    clearInterval(interval);
}, 1*60000 + 100);
/*arra = [50, 60, 70, 30, 30];
console.log(arra.filter((number) => {
    return number > 50;
}).length);
console.log(arra.indexOf(30));
let csvBody = "";
fs.readFile('./cars.csv', (err, data) => {
    if(err){
    }else{
        csvBody = data.toString();
    }
});
setTimeout(() => {
    for(i=0; i<75; i++){
        csvBody += ((Math.random()*50+20).toFixed(0) +"," + (Math.random()*106000+60000).toFixed(0) + "\n");
    
    }
}, 1000);

setTimeout(() => {
    fs.writeFileSync('./cars.csv', csvBody,'utf8');
  
}, 3000);*/


/*request('http://localhost:9090/api/v1/query?query=ledger_blockchain_height&time=1594288905', function (error, response, body) {
    if(!error){
        console.log(JSON.parse(body).data.result);
    } else {
        console.log(error);
    }
});*/
