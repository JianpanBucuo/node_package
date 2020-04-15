const { SlowBuffer } = require("buffer") ;
const  fs = require('fs')
 
function log(item) {
    console.log(item)
}

const rs = fs.createReadStream('./a.txt', {
    highWaterMark :11
})
let str = ''
rs.on('data',(data) => {
    
    str +=data
})
rs.on('end',() => {
    console.log(str)
})
console.log(require.extensions)
console.log(process.memoryUsage())