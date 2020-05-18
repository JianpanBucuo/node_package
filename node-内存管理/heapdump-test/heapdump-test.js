// --registry=https://registry.npm.taobao.org
https://github.com/nodejs/node-gyp 
// npm install --global --production windows-build-tools
// 安装vscode2015 Visual C++ Build Tools
// npm config set msvs_version 2015
// node-gyp install --dist-url https://npm.taobao.org/mirrors/node
// node-gyp rebuild --nodedir ~/work/node-v10.15.0
// node-gyp rebuild 编码错误 
// python -> \Python27\Lib\site-packages
/*
import sys
reload(sys)
sys.setdefaultencoding('gbk') #set default encoding to utf-8
*/
// npm config ls
// 
// src -> binding.cc 新建一个空文件
npm install node-gyp --save
node-gyp rebuild
npm install heapdump --save 
const http = require('http')
const leakArray = []
const leak = () => {
    leakArray.push(Math.random())
}

http.createServer((req, res) => {
    leak()
    res.writeHead(200,{
        'Content-type':'text/plain'
    })
    console.log(leakArray)
    res.end('Hello ')
}).listen(1337)