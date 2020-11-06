
const csv = require('csvtojson');
const fs = require('fs');
const request = require('postman-request');
const { constants } = require('buffer');
const yargs = require('yargs');
//const request = require('request');

let velocities = [];
let timeStart = [];
velocities = [];
let distance = [];
let inde = [];

const argv = yargs
    .command('launchDetections', 'Generate detections during the given time', {
        minTimeData: {
            description: 'minimum time for timeData',
            alias: 'mi',
            type: 'number',
        }
      }
    )
.help().alias('help', 'h').argv;

if (argv._.includes('launchDetections')) {

    console.log(argv.minTimeData);

}


/*async function main() {
   let a = [];
   a.push(Date.now())
   
    console.log(JSON.stringify(a));
}

main()*/



/*csv().fromFile('./cars4.csv').then((res) => {
    for (let i = 0; i < res.length; i++){
        velocities.push(res[i].VELOCITY);
        timeStart.push(res[i].TIME_START);
        inde.push(i);
        
        
    }

    fs.writeFileSync("./testV.csv", JSON.stringify(velocities),'utf8');
    fs.writeFileSync("./testT.csv", JSON.stringify(timeStart),'utf8');
    fs.writeFileSync("./testI.csv", JSON.stringify(inde),'utf8');
});*/



let y = 0;
request('http://dummy.restapiexample.com/api/v1/employees', function (error, response, body) {
    if(!error){
        y= JSON.parse(body).data;
    } else {
        y= error;
    }
});

    console.log(y) 


/*
let initialTime = Date.now();

let interval = setInterval(() => {

    
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
