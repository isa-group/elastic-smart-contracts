/*let interval = setInterval(() => {
    console.log("Hola");

}, 1000);

setTimeout(() => {
    clearInterval(interval);
}, 5100);*/
for (let index = 1; index < 5; index++) {

    setTimeout(() => {
       console.log(new Date().toLocaleDateString().replace("/","_").replace("/","_"));
    }, 1000);

    
}