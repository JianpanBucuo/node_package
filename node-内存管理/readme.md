# 内存控制

基于无阻塞，事件驱动建立的node服务，具有内存消耗低的优点，非常适合处理海量的网络请求。
在海量请求的前提下，开发者就需要考虑一些平常不会形成影响的问题。

>内存控制正是在海量请求和长时间运行的前提下进行探讨的。

## V8的垃圾回收机制与内存限制

### V8的内存限制

在一般的后端开发语言中，在基本的内存使用上没有什么限制，然而在`node中通过javascript使用内存`时就会发现只能使用部分内存`（64位系统下约为1.4GB / 32位系统下约为0.7GB）`

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

##### Mark-Sweep 标记清除

标记清除分为`标记`和`清除`两个阶段，

Mark-Sweep在标记阶段遍历堆中的所有对象，并标记活着的对象，在随后的清除阶段中，只清除没有被标记的对象。

> Scavenge中只复制活着的对象， Mark-Sweep只清理死亡对象
> 活对象在新生代中只占较小部分，死对象在老生代中只占较小部分，这是两种回收方式能高效处理的原因。

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/mark-sweep.png" width="417" height="223"/>

Mark-Sweep最大的问题是进行一次标记清除回收后，`内存空间会出现不连续的状态`，这种内存碎片会对后续的内存分配造成问题，因为很可能出现需要分配一个大对象的情况，这时所有的碎片空间都无法完成此次分配，就会提前触发垃圾回收，而这次回收是不必要的。

##### Mark-Compact 标记整理

标记整理是在标记清除基础上演变而来，差别在于对象在标记为死亡后，在整理的过程中，会将活着的对象往一端移动，移动完成后，直接清理掉外界外的内存。（是标记过程中整理， 还是边标记边整理？）

> 由于Mark-Compact过程中需要移动对象，所以它的执行速度不可能很快，V8主要是用Mark-Sweep，`在空间不足以对从新生代晋升过来的对象进行分配时`才使用Mark-Compact

#### Incremental Marking 增量标记

为了避免出现Javascript应用逻辑与垃圾回收器看到的情况不一致，垃圾回收的3种基本算法都需要将应用逻辑停下来，待执行完垃圾回收后再恢复执行应用逻辑，这种行为称为`全停顿（stop-the-world）`。

> 在V8的分代式垃圾回收中，一次小垃圾回收只收集新生代，由于新生代默认配置的较小，且其中存活对象通常较小，所以即便它是全停顿，影响也不大

> 老生代通常配置的比较大， 且存活对象比较多，全堆垃圾回收（full 垃圾回收）的标记，清理，整理等等做造成的停顿就会比较可怕

为了降低全堆垃圾回收带来的停顿时间，V8先从标记阶段入手，将原本要一口气停顿完成的动作改为`增量标记（incremental marking）`，也就是拆分为许多小`步进`，每做完一`步进`就让javascript应用逻辑执行一会儿，垃圾回收与应用逻辑交替执行直到`标记阶段`完成

> 经过增量标记改进后，垃圾回收的最大停顿时间可以减少到原来的`1/6`左右

## 高效使用内存

在V8面前，开发者所要具备的责任是如何让`垃圾回收机制更高效的工作`

### 局部变量

```js
 function foo() {
     var local = {}
 }
 foo()

```

foo()函数在每次被调用时都会创建局部作用域，同时在该作用域中声明局部变量。函数执行结束后该局部作用域会被销毁，
而声明的局部变量也会随其作用域的销毁而销毁。
> 由于对象非常小，对象将会分配在新生代中的From空间中。在作用域释放后，局部变量local是小，其引用的对象将会在下次垃圾回收时被释放。

### 全局变量

如果变量是全局变量，由于全局作用域需要直到进程退出才能释放，此时将导致引用的对象成为常驻内存（老生代）

如果需要释放常驻内存的对象，可以通过`delete`操作来删除引用关系，或者将变量重新赋值，让旧的代码脱离引用关系。
```js
 global.foo = 'foo'
 delete global.foo
 //或者
 global.foo = undefined
```

### 闭包

```js

const foo = function() {
    const local = 'local var'
    return function () {
        console.log(local)
    }
}
const baz = foo()
console.log(baz())

```
由于foo函数返回时，返回的是一个`匿名函数和该函数的作用域`，一旦有函数引用这个匿名函数，这个匿名函数的作用域将不会被释放。`除非解除引用，其作用域才会被释放`

> 由于无法立即回收闭包和全局变量引用的内存，要十分小心此类变量的增加，因为他会导致老生代中对象的增加。

### 查看内存的使用情况

```js
const os = require('os') 
function showMem () {
    const mem = process.memoryUsage()
    const format = function(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + 'M B'
    }
    console.log(`Process: heapTotal: ${format(mem.heapTotal)}, heapUsed: ${format(mem.heapUsed)}, rss: ${format(mem.rss)}`)
    console.log(`OS: total: ${format(os.totalmem())}, freemem: ${format(os.freemem())}`)
    console.log('--------------------------------')
}

const total = []
const useMem = function() {
    const size = 20 * 1024 * 1024
    const arr = new Array(size)
    for(let i = 0; i< size; i++) {
        arr[i] = 0
    }
    return arr
}
for (let i = 0; i< 15; i++) {
    showMem()
    total.push(useMem())
}

```

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/memory-usage.png" width="798" height="448"/>

在接近1500MB的时候，无法继续分配内存，然后进程内存溢出，导致进程退出。

#### 查看系统的内存占用

```js
const os = require('os')

os.totalmem() //系统总内存
os.freemen() // 系统闲置内存
```
#### 堆外内存

```js
const os = require('os') 
function showMem () {
    const mem = process.memoryUsage()
    const format = function(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + 'M B'
    }
    console.log(`Process: heapTotal: ${format(mem.heapTotal)}, heapUsed: ${format(mem.heapUsed)}, rss: ${format(mem.rss)}`)
    console.log(`OS: total: ${format(os.totalmem())}, freemem: ${format(os.freemem())}`)
    console.log('--------------------------------')
}

const total = []
const useMem = function() {
    const size = 200 * 1024 * 1024
    const buff = new Buffer(size)
    for(let i = 0; i< size; i++) {
        buff[i] = 0
    }
    return buff
}
for (let i = 0; i< 10; i++) {
    showMem()
    total.push(useMem())
}

```

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-内存管理/buffer-os.png" width="713" height="421"/>

如图可以看出堆中的内存总量变化较小，这意味着node中的内存使用并非都是通过V8进行分配的，我们将那些不是通过V8分配的内存称为`堆外内存`

> node的内存构成主要由V8进行分配的部分和node自行分配的部分，受V8的垃圾回收限制的主要是V8的堆内存。

#### 内存泄漏

>实质： 应当回收的对象出现意外而没有被回收，变成了常驻的老生代中的对象

造成内存泄漏的原因有如下几个

- 缓存
- 队列消费不及时  `?` 
- 作用域未释放