## Koa2使用

### 使用环境
node版本大于8.0

## 洋葱模型
```js
const Koa = require('koa');
const app = new Koa();

// logger
app.use(async (ctx, next) => {
  console.log('第一层洋葱 - 开始')
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  console.log('第一层洋葱 - 结束')
});

// x-response-time
app.use(async (ctx, next) => {
  console.log('第二层洋葱 - 开始')
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  console.log('第二层洋葱 - 结束')
});

// response
app.use(async ctx => {
  console.log('第三层洋葱 - 开始')
  ctx.body = 'Hello World';
  console.log('第三层洋葱 - 结束')
});

app.listen(8000);
```

- 第一层洋葱 - 开始
- 第二层洋葱 - 开始
- 第三层洋葱 - 开始
- 第三层洋葱 - 结束
- 第二层洋葱 - 结束
- 第一层洋葱 - 结束

### 安装
使用脚手架工具
npm install koa-generator -g
koa2 project
### 目录调整

### koa优势/劣势
 
 1. 基于async/await的node框架，可以优雅的处理异步函数（避免多层回调）
 2. 便于记录完成请求所需的时间(洋葱模型)
 3. 便于捕获错误(洋葱模型)
 4. 
 ```js
app.use(async (ctx, next) => {
  try {
    await next()
  }catch(E) {
    ctx.status = 400
    ctx.body = '服务端错误'
  }
})

app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} -  ${ms}ms`)
})


 ```
 

## Koa在单服务项目下的使用规范

## Koa在微服务项目下的使用规范
 
## 周边工具选择
1. mysql  sequelize ORM工具
2. jest单元测试
3. cross-env 区分开发环境
4. nodemon 热更新
5. pm2 线上管理工具
6. redis 内存共享
