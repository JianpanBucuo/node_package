# 内存控制

基于无阻塞，事件驱动建立的node服务，具有内存消耗低的优点，非常适合处理海量的网络请求。
在海量请求的前提下，开发者就需要考虑一些平常不会形成影响的问题。

>内存控制正在试海量请求和长时间运行的前提下进行探讨的。

## V8的垃圾回收机制与内存限制

### V8的内存限制

在一般的后端开发语言中，在基本的内存使用上没有什么限制，然而在node中通过javascript使用内存时就会发现只能使用部分内存`（64位系统下约为1.4GB / 32位系统下约为0.7GB）`

在这样的限制下，node无法直接操作大内存对象，比如无法将一个2GB的文件读入内存中进行字符串分析处理，
即使物理内存有32GB，这样在`单个进程`的情况下，计算机的内存资源无法得到充分的利用。

### V8的对象分配

在V8种，所有的javascript对象都是通过堆来分配的，node提供了V8的内存使用量的查看方式

```js
console.log(
    process.memoryUsage()
)
// { rss: 20869120,
//   heapTotal: 6537216,
//   heapUsed: 3855056,
//   external: 8272 }
```
key  |	含义
---|---
rss | 常驻内存（Resident Set）
heapTotal | 已申请到的堆内存
heapUsed | 当前已使用的堆内存
external | c++对象绑定到js的内存

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/rss.png" width="369" height="413"/>

当我们在代码中声明变量并赋值时，所使用对象的内存就分配在堆中。 如果已申请的堆内存不够分配新的内存，将继续申请堆内存，直到堆的大小超过V8的限制为止。`（64位系统下约为1.4GB / 32位系统下约为0.7GB）`

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/heap.png" width="549" height="153"/>

至于为什么V8要限制堆的大小，表层原因为V8最初为浏览器设计，不太可能遇到用大量内存的场景。
深层原因是V8的`垃圾回收机制`的限制。

> 以1.5G的垃圾回收堆内存为例，V8做一次小的垃圾回收需要`50毫秒`以上，
> 做一次`非增量式的垃圾回收`甚至要`1秒`以上。
> 这是垃圾回收中引起`javascript线程暂停执行的时间`，在这样的时间花销下，应用的性能和相应能力都会直线下降

因此，在当时的考虑下直接限制堆内存大小是一个好的选择

node在启动时可以调整内存限制的大小
```js
node --max-old-space-size=1700 index.js //单位为MB

node --max-new-space-size=1024 index.js //单位为KB

```

### V8的垃圾回收机制







<!-- https://juejin.im/post/5a4f1281f265da3e484ba02f -->