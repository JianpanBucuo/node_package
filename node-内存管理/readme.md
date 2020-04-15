# 内存控制

基于无阻塞，事件驱动建立的node服务，具有内存消耗低的优点，非常适合处理海量的网络请求。
在海量请求的前提下，开发者就需要考虑一些平常不会形成影响的问题。

>内存控制正是在海量请求和长时间运行的前提下进行探讨的。

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
rss | 常驻内存（Resident Set）（0.7G/1.4G）
heapTotal | 已申请到的堆内存
heapUsed | 当前已使用的堆内存
external | c++对象绑定到js的内存

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/rss.png" width="810" height="420"/>

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

V8的垃圾回收策略主要基于`分带式垃圾回收机制`

#### V8的内存分代

在V8中，主要讲内存分为`新生代`和`老生代`。

新生代中的对象为存活时间较短的对象

老生代中的对象为存活时间较长或常驻对象的内存

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/fendai.png" width="549" height="153"/>

V8堆的整体大小就是新生代所使用内存空间加上老生代的内存空间

> node --max-old-space-size=1700 index.js  // 设置老生代内存空间的最大值

> node --max-new-space-size=1024 index.js  // 设置新生代内存空间的最大值

`新生代内存`的最大值在64位系统和32位系统分别为 `32MB/16MB`

`老生代内存`的最大值在64位系统和32位系统分别为 `1400MB/700MB`

默认情况下，V8的堆内存的最大值在64位系统为 `1464MB`（1400 + 32 + 32），在32位系统则为 `732MB` （700 + 16 + 16）

> 这个数值可以解释为何在64位系统下只能使用约1.4BG内存，在32位系统下只能使用约0.7GB内存

#### Scavenge算法

在分带的基础上，`新生代`中的对象主要通过Scavenge算法进行垃圾回收

> Scavenge算法中主要采用了`Cheney算法`

Cheney算法是一种采用`复制的方式`实现的垃圾回收算法。它将内存`一分为二`，每一部分空间成为`semispace`。
在这两个semispace中，`只有一个处于使用中，另一个处于闲置状态`。处于使用状态的semispace空间称为`From空间`，处于闲置状态的semispace空间成为`To空间`。

当我们分配对象时，先是在From空间中进行分配。当开始垃圾回收时，会检查From空间中的存活对象，这些存活对象将会被复制到To空间中，而非存活对象占用的空间将会被释放。

完成复制后，From空间和To空间的角色发生兑换。

> 简而言之，在垃圾回收的过程中，就是通过将存活对象在两个semispace空间之间进行复制。
> Scavenge的缺点是只能使用堆内存的一半，这是由划分空间和复制机制所决定的。
> 但Scavenge由于只复制存活的对象，并且对于生命周期短的场景存活对象只占少部分，所以它在时间效率上有优异的表现。

> Scavenge是典型的牺牲时间换取空间的算法，所以无法大规模地应用到所有垃圾回收中。

#### 晋升

对象从新生代中移动到老生代中的过程称为晋升。

对象晋升的条件主要有两个，一个是对象是否经历过Scavenge回收，一个是To空间的内存占用比超过限制。

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/from-to.png" width="836" height="375"/>

> 设置25%这个限制值的原因是当这次Scavenge回收完成后，这个To空间将变成From空间，接下来的内存分配将在这个空间中进行。如果占比过高，会影响后续的内存分配。

#### Mark-Sweep & Mark-Compact

V8在老生代中主要采用`Mark-Sweep`和`Mark-Compact`相结合的方式进行垃圾回收













<!-- https://juejin.im/post/5a4f1281f265da3e484ba02f -->
