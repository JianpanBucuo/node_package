const http = require('http');

const server = http.createServer();
server.listen(3000,()=>{
    process.title='';
    console.log('进程id',process.pid)
})

 