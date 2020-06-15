
const csv = require('csvtojson');

let velocities = [];
let timeStart = [];
let inde = []

/*csv().fromFile('./cars.csv').then((res) => {
    for (let i = 0; i < res.length; i++){
        velocities.push(res[i].VELOCITY);
        timeStart.push(res[i].TIME_START);
        inde.push(i);
    }
});

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
console.log(arra.indexOf(30));*/
let bySection = [1,4,8,3]

let total = bySection.map((a)=> {
    return Math.sqrt(a);
});
console.log(total);