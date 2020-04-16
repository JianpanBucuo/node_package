const os = require('os') 
function showMem () {
    const mem = process.memoryUsage()
    const format = function(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + 'M B'
    }
    console.log(`Process: heapTotal: ${format(mem.heapTotal)}, heapUsed: ${format(mem.heapUsed)}, rss: ${format(mem.rss)}`)
    console.log(`OS: total: ${format(os.totalmem())}, freemem: ${format(os.freemem())}`)
    console.log('--------------------------------')
}

const total = []
const useMem = function() {
    const size = 200 * 1024 * 1024
    const buff = new Buffer(size)
    for(let i = 0; i< size; i++) {
        buff[i] = 0
    }
    return buff
}
for (let i = 0; i< 10; i++) {
    showMem()
    total.push(useMem())
}
