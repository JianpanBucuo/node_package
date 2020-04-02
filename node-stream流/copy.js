const path = require('path')
const fs = require('fs')
var memeye = require('memeye')
memeye()
function copyFile(originPath, disPath) {
    fs.readFile(originPath, (err, data) => {
        if(err) {
            return 
        }
         fs.writeFile(disPath,data.toString() ,(err) => {
             if(err) {
                 return 
             }
             console.log('写入成功')
         })
    })
}


function streamCopy(originPath, disPath) {
    const v1 = fs.createReadStream(originPath)
    const v2 = fs.createWriteStream(disPath)
    v2.on('data',(chunk) => {
        console.log(chunk)
    })
    v1.pipe(v2)
}
const fileNam1 = path.resolve(__dirname, './a.txt')
const fileNam2 = path.resolve(__dirname, './c.txt')
// streamCopy(fileNam1, fileNam2)
// copyFile('./a.txt','./b.txt')
setTimeout(function () {
    // 连续执行 100 次拷贝
    var i
    for (i = 0; i < 100; i++) {
        // streamCopy(fileNam1, fileNam2)
        copyFile('./a.txt','./b.txt')
    }
}, 5000)