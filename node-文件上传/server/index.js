const http = require('http')
const {serveStatic} = require('./helper')
const path =require('path')
const uploadImg = require('./upload')
const cache = {} //缓存
const server = http.createServer((req, res) => {
    if(req.url == '/favicon.ico') {
        return
    }
    console.log(req.url)
    let filePath = ''
    if(req.url == '/utils/upload' && req.method.toLowerCase() == 'post') {
        
        uploadImg(req, res)
        return;
    }
    if (req.url == '/') {
        filePath = './public/index.html'
    } else {
        filePath = './public' + req.url
    }
    serveStatic(res,cache, filePath)
})
server.listen(3000)