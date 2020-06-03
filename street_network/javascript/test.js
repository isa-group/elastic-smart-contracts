/*let interval = setInterval(() => {
    console.log("Hola");

}, 1000);

setTimeout(() => {
    clearInterval(interval);
}, 5100);*/
const csv = require('csvtojson');

async function main() {
    let cars = [];
    await csv().fromFile('./cars.csv').then((res) => {
        cars = res;
       });


       let timeDiference = 0.1;
       let numberCars = 0;


       for (let i = 0; i < cars.length; i++){
           if((cars[i].VELOCITY * timeDiference) < 199999 && (cars[i].VELOCITY * timeDiference) >= 0.1){
            console.log(cars[i].VELOCITY);
           }
       }
       let d = 0;
       let c = cars.reduce((a,b)=>{
           d+= parseInt(b.VELOCITY);
        return a + b;
    });
       console.log(d);
}
main();