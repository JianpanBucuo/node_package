const fs = require('fs')
const path = require('path')
const readline = require('readline')

const filename = path.resolve(__dirname, './a.txt')
const readStream = fs.createReadStream(filename)

const rl = readline.createInterface({
    input: readStream
})
rl.on('line',(lineData) => {
    console.log('-line-')
})
rl.on('close', () => {
    console.log('line end')
})