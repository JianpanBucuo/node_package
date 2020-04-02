# Stream流

数据从原来的 source 流向 dest ，要像水一样，慢慢的一点一点的通过一个管道流过去

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-stream流/stream.jpg" width="514" height="510"/>


```js
var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer((req, res) => {
    const fileName = path.resolve(__dirname,'a.txt')
    let stream = fs.createReadStream(fileName)
    stream.pipe(res)
})

```

## source - 从哪里来

stream 常见的来源方式主要有三种：

1. 控制台输入
2. http请求中的request
3. 读取文件

 stream 对象可以监听 `data` `end` 事件

 `data`事件用来监听输入的传入

 `end`事件用来监听数据传输完毕

```js
var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {
    var method = req.method; // 获取请求方法
    if (method === 'POST') { // 暂只关注 post 请求
        req.on('data', function (chunk) {
            // 接收到部分数据
            console.log('chunk', chunk.toString().length);
        });
        req.on('end', function () {
            // 接收数据完成
            console.log('end');
            res.end('OK');
        });
    }
    // 其他请求方法暂不关心
});
server.listen(8000);
```

 ## dest - 到哪里去

 stream对象的常见输出对象有三种

 1. 输出到控制台
 2. http请求中的response
 3. 写入文件

如果想让数据直接从输入流到输出，使用如下代码

```js

process.stdin.pipe(process.stdout) // source.pipe(dest) 形式

var fs = require('fs')
var readStream = fs.createReadStream('./file1.txt')  // source
var writeStream = fs.createWriteStream('./file2.txt')  // dest
readStream.pipe(writeStream) // source.pipe(dest) 形式
```

## stream的使用场景

http请求和文件操作都属于I/O操作，即stream的应用场景就是处理I/O，这就回到了stream的本质

`由于一次性I/O操作过大，硬件开销过多，内存开销过大，影响软件运行效率，因此将I/O分批分段操作，让数据一点一点流动起来，直到完成操作`


## readline 逐行读取

相比于 stream 的 `data` 和 `end` 自定义事件， readline 需要监听 `line` 和 `close` 两个自定义事件

```js
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
```