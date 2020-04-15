const mime = require('mime')
const path = require('path')
const fs = require('fs')

function send404 (response) {
    response.setHeader('Content-type','text/plain')
    response.end('Error 404: resource not found')
}

function sendFile(res, filePath, fileContent) {
    res.setHeader('Content-type',mime.getType(filePath))
    res.end(fileContent)
}
// res.writeHead(200,{
//     "content-type":"text/html;charset=utf-8",
//     "Access-Control-Allow-Origin":"*",
//     "Access-Control-Allow-Headers":"*"
// })
 
function serveStatic(res, cache, absPath) {
    if(cache[absPath]) {
        sendFile(res, absPath, cache[absPath])
    } else {
        fs.readFile(absPath, (err, data) => {
            if(err) {
                send404(res)
                return
            } else {
                cache[absPath] = data
                sendFile(res, absPath, data)
            }
        })
    }
}


module.exports = {
    serveStatic
}