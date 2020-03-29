# node基本概念

## 单线程

我们经常提到node是单线程的

这是的单线程仅仅只是Javascript执行在单线程中，除了这部分以外，很多部分都是多线程的

I/O操作实际上是交给libuv来做的，而libuv提供了完整的线程池，所以I/O操作都是可以并行的


<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-基本概念/component.png" width="707" height="348"/>
## I/O

### 阻塞I/O

特点：在调用系统内核之后一定要等到系统内核层面完成所有操作后，才返回应用层调用才结束。

以读取磁盘上的一段文件为例，系统内核在完成磁盘寻道，读取数据，复制数据到内存中之后，这个调用才结束

- 阻塞I/O造成CPU等待I/O，浪费等待事件，CPU的处理能力不能得到充分利用

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-基本概念/sync.png" width="310" height="328"/>

### 非阻塞I/O

特点：在调用系统内核之后，不带数据直接返回到应用层，要获取数据，还需要通过文件描述符再次读取

优点：在非阻塞I/O返回后，CPU的时间片可以用来处理其他事物，此时的性能提升是明显的。

缺点：由于调用非阻塞I/O后返回的不是应用层期望的数据，而仅仅是当前调用的状态。为了获取完整的数据，应用程序需要重复调用I/O操作来确认是否完成

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-基本概念/async.png" width="317" height="385"/>

`非阻塞同步I/O：需要轮询去确认是否完成数据获取`

`非阻塞异步I/O：等待I/O完成后的通知，执行回调，用户无需考虑轮询`

### node的异步I/O

#### 事件循环机制

在进程启动时，node便会创建一个类似于while(true)的循环，每执行一次循环体的过程我们称之为*Tick*。每个Tick的过程就是查看是否有事件待处理，如果有，就取出事件及相关的回调函数并执行它们。然后进入下一个循环（Tick）。如果不再有时间处理，就退出进程。

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-基本概念/event_circle.png" width="433" height="484"/>

#### 观察者

在Tick的过程中有一个或多个观察者，而判断是否有事件待处理的过程就是向这些观察者询问是否有要处理的事件

在node中事件主要来源于网络请求，文件I/O等，这些事件的观察者有*文件观察者* *网络观察者*

#### 异步I/O过程

- 从Javascript发起调用到内核执行完I/O操作的过程中，存在一种中间产物，叫做请求对象

1. javascript调用核心模块并立即返回到javascript线程，执行当前任务的后续操作
2. I/O操作结束后会将数据存储在请求对象上，并通知IOCP
3. I/O观察者查看IOCP是否有执行完的请求，如果存在，会将请求对象加入I/O观察者队列中，然后将其当作事件处理

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-基本概念/async-zhouqi.png" width="361" height="371"/>

<img src="https://github.com/JianpanBucuo/node_package/blob/master/node-基本概念/async_picture.png" width="561" height="510"/>

## node的优势

1. 利用单线程，远离多线程死锁，状态同步等问题
2. 利用异步I/O，让单线程远离阻塞，以更好的提高CPU利用率