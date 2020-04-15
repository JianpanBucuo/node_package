# Buffer

在Node中，应用需要处理*网络协议*，*操作数据库*，*处理图片*，*接收上传文件*等，在网络流和文件的操作中，还要处理大量二进制数据，Javascript自有的字符串远远不能满足这些需求，于是Buffer应运而生

## Buffer结构

Buffer是一个像Array的对象，主要用来操作字节，下面我们从*模块结构*和*对象结构*的层面上来认识它

### 模块结构

Buffer是一个典型的Javascript和C++结合的模块，它将性能相关部分用C++实现，将非性能相关的部分用Javascript实现

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-buffer/node_buffer.png" width="493" height="234"/>

Buffer所占用的内存不是通过V8分配的，属于堆外内存

由于Buffer太常见，Node在进程启动时就已经加载了它

### 对象结构

Buffer对象类似于数组，它的`元素`为`16进制的两位数`。即0到255的值。

可以使用length属性得到buffer对象长度，使用下标访问元素

```js

const str = '深入浅出node.js'
const buffer = Buffer.from(str,'utf-8')
// const buffer = new Buffer(str, 'utf-8')
console.log(buffer)
// => <Buffer e6 b7 b1 e5 85 a5 e6 b5 85 e5 87 ba 6e 6f 64 65 2e 6a 73>
console.log(buffer.length)
// => 19
console.log(buffer[0])
// => 230 (16 * 14 + 6)
```

由案例所示，不同编码的字符串占用的`元素个数`各不相同，

> 上面代码中的中文字在 UTF-8编码下占用三个元素，字母和标点符号占用一个元素

## Buffer内存分配

?

## Buffer的转换

Buffer对象可以与字符串之间互相转换，目前支持的字符串编码类型有如下这几种

- ASCII
- UTF-8
- UTF-16LE/UCS-2
- Base64
- Binary
- Hex

### 字符串转Buffer

```js
const str = '深入浅出node.js'
const buffer = Buffer.from(str,'utf-8')
```

### Buffer转字符串

```js
buffer.toString([encoding],[start], [end])
// 可以设置encoding值 默认为 utf-8 
// 可以设置起始位和结束为，指定局部需要转换的编码 
```

### Buffer的拼接

### 乱码

```js
const rs = fs.createReadStream('./a.txt', {
    highWaterMark :11
})
let str = ''
rs.on('data',(data) => {
    str +=data
    //等价于 str = str.toString() + data.toString()
})
rs.on('end',() => {
    console.log(str)
})
// -> <Buffer e5 ba 8a e5 89 8d e6 98 8e e6 9c>
// -> <Buffer 88 e5 85 89 ef bc 8c e7 96 91 e4>
// -> <Buffer bc bc e5 9c b0 e4 b8 8a e9 9c 9c>
// -> <Buffer e3 80 82>
// ->床前明���光，��似地上霜。
```

data事件中的chunk对象即是Buffer对象。

中文字在UTF-8下占三个字节

>所以第一个Buffer对象在输出时，只能显示三个中文，剩下两个字节（e6， 9c）将会以乱码形式显示
>第二个Buffer对象的第一个字节也不能形成文字，只能显示乱码

### setEncoding()

该方法的作用是让data事件中传递的不再是一个Buffer对象，而是编码后的字符串。

```js
const rs = fs.createReadStream('./a.txt', {
    highWaterMark :11
})
rs.setEncoding('utf8')
let str = ''
rs.on('data',(data) => {
    console.log(data)
    str +=data
})
rs.on('end',() => {
    console.log(str)
})
// 床前明
// 月光，疑
// 似地上霜
// 。
// 床前明月光，疑似地上霜。
```

在setEncoding()之后，可读流对象在内部设置了一个decoder对象（string_decoder类的实例）。
每次data事件都通过`decoder对象进行Buffer到字符串的解码`，然后传递给调用者。

#### 月为何能够正常显示

`月`字的前两个字节被保留在StringDecoder实例内部，第二次输出时，会将这剩余两个字节和后续11个字节组合在一起，再次用3的整数倍字节进行转码

它目前只能处理 utf-8， base64 和 ucs-2/utf-16e这三种编码。岁让setEncoding的方式不可否认能够解决大部分的乱码问题，但并不能从根本上解决该问题。


