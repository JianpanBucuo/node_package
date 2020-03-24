# fs模块

Node.js中的fs模块是文件操作的封装，它提供了文件读取 写入 更名 删除 遍历目录 链接等POSIX文件系统操作。

fs模块中所有的操作都提供了异步和同步两个版本，具有 sync后缀的方法为同步方法

## 标识符

标识符代表着对文件的操作方式

符号  |	含义
---|---
r | 读取文件，如果文件不存在则抛出异常
r+ | 读取并写入文件，如果文件不存在则抛出异常?
rs | 读取并写入文件，指示操作系统绕开本地文件系统缓存
w | 写入文件，文件不存在会被创建，存在则清空后写入
wx | 写入文件，排它方式打开
w+ | 	读取并写入文件，文件不存在则创建文件，存在则清空后写入
wx+ | 和 w+ 类似，排他方式打开
a |　追加写入，文件不存在则创建文件
ax | 与a类似，排它方式打开
a+ | 读取并追加写入，不存在则创建
ax+ | 与a+类似，排它方式打开

- r: 读取
- w: 写入
- s: 同步
- +: 增加相反操作
- x: 排它方式

### r+ 与 w+ 区别

文件存在时

> r+ 不会自动清空已有文件 并读取

> w+ 会自动清空已有文件 并写入

文件不存在时

> r+ 不会创建文件 并抛出异常

> w+ 会自动创建文件

## 文件操作

### 文件读取 fs.readFile / fs.readFileSync

`fs.readFile(filename,[encoding/options],[callback(error, data)])`
```js
options:{flag:r,encoding: null} //默认值
```
`fs.readFileSync(filename,[, options])`
参数
1. filename 必选 代表文件名
2. encoding 可选 表示文件字符编码
3. callback 必选 如果指定 encoding, data是一个解析后的字符串，否则将会以 Buffer 形式表示的二进制数据

```js
 const fs = require('fs')
 const path = require('path')

 fs.readFile('./a.txt','utf-8',function(err, data) {
     console.log(JSON.parse(data))
 })
 const content =  fs.readFileSync('./a.txt','utf-8')
 console.log('content:', content)
```

### 文件写入 fs.writeFile
`fs.writeFile(filename,data, [options], callback)`

1. filename 必选 文件名
2. data 必选 要写的数据
3. options 可选参数
4. callback 回调

- encoding 默认值: 'utf8'。
- mode <integer> 默认值: 0o666。
- flag <string>  默认值: 'w'
```js
 fs.writeFile('./a.txt','异步写入', {
    encoding:'utf-8',
    'flag':'a'
},function(err, data) {
    console.log('异步写入成功')
})
 
fs.writeFileSync('./a.txt','同步写入',{
    encoding:'utf-8',
    'flag':'a'
})

```


### fs.appendFile
`fs.appendFile(filename, data, [options], callback)`

- 该方法与fs.write相似，区别是 fs.write默认 flag: w, fs.appendFile 默认flag: a 追加写入
```js
fs.appendFile('./a.txt','追加写入', {
    encoding:'utf-8'
},(err) => {
    var data = fs.readFileSync('./a.txt','utf-8')
    console.log(data)
})
```