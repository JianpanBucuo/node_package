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
    const size = 20 * 1024 * 1024
    const arr = new Array(size)
    for(let i = 0; i< size; i++) {
        arr[i] = 0
    }
    return arr
}
for (let i = 0; i< 15; i++) {
    showMem()
    total.push(useMem())
}
