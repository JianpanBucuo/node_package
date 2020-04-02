var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer((req, res) => {
    const fileName = path.resolve(__dirname,'a.txt')
    let stream = fs.createReadStream(fileName)
    stream.pipe(res)
}).listen(3000)


process.stdin.on('data', function (chunk) {
    console.log('stream by stdin', chunk.toString())
})
console.log('asasas')