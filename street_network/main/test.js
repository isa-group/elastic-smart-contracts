
const csv = require('csvtojson');
const fs = require('fs');
const request = require('postman-request');
const { constants } = require('buffer');
const yargs = require('yargs');



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

let velocities = [];
let timeStart = [];
let inde = [];
let initialTime = Date.now()

csv().fromFile('./cars5.csv').then((res) => {
    for (let i = 0; i < res.length; i++){
        velocities.push(res[i].VELOCITY);
        timeStart.push(res[i].TIME_START);
        inde.push(i);
        
        
    }
});
let flow = 0;
let total = 0;
let count = 0;
let count2 = 0;

let t = []
setInterval(() => {
    let before = []
    let before_timeData = []
    let after = []
    let d = Date.now()+2380000
    for (let i = 0; i < inde.length; i++) {
         after.push(velocities[i] * (d - initialTime - timeStart[i])/3600);
         before.push(velocities[i] * (d - initialTime - 1000 - timeStart[i])/3600);
         if(((d - initialTime - (1800*1000)) < timeStart[i]) && timeStart[i] < d - initialTime){
            before_timeData.push(velocities[i] * (d - initialTime - (1800*1000) - timeStart[i])/3600);
         }
    };
    for (let i = 0; i < before_timeData.length; i++) {
        if((before_timeData[i] >= 0 || after[i] >= 0) && before_timeData[i] < 1000){
            count++;
            if(before_timeData[i] <= 0){
                if(after[i] >= 1000){
                    t.push([before_timeData[i], after[i],timeStart[i]])
                    total+= 1000;
                }else{
                    t.push([before_timeData[i], after[i],timeStart[i]])
                    total+= after[i];
                }

            }else{
                t.push([before_timeData[i], after[i],timeStart[i]])
                total+= after[i] -before_timeData[i];
            }
    
        }      
        
    }
    console.log(total/(1800*1000))
    total = 0;
    count = 0;
    count2 = 0;
 
}, 1000);
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
