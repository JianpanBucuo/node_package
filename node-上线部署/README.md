# 线上环境

## 需要注意的点

- 服务器稳定性
- 充分利用服务器硬件资源，以便提高性能
- 线上日志记录

## pm2

### 核心价值

- 进程守护，系统崩溃自动重启
- 启动多进程，充分利用CPU和内存
- 自带日志记录功能

### 下载安装

`npm install --save pm2`

### 基本使用

常用命令  |	含义
---|---
pm2 start app.js | 启动服务（pm2 start [入口文件]）
pm2 list | 查看当前服务列表
pm2 restart [appName]/[id] | 重启进程
pm2 stop [appName]/[id] | 停止进程
pm2 stop [appName]/[id] | 删除进程
pm2 info [appName]/[id] | 查看该进程下基本信息(日志记录文件目录/git信息...)
pm2 log [appName]/[id] | 当前进程下的日志
pm2 monit  [appName]/[id] | 查看该进程下cpu和内存信息

### 集成守护

pm2遇到进程崩溃，会自动重启

### 配置

`新建配置文件 pm2.config.json`
```js
{
    "apps":{
        "name": "pm2-server", // app Name
        "script":"./app.js", //入口文件
        "watch":true, //是否监听文件变化自动重启
        "ignore_watch":[
            "node_modules",
            "logs",
            "uploadFiles",
            "README.md"
        ],
        "instances": 4, //进程数量
        "error_file":"./logs/error.log", //自定义存放错误日志文件目录
        "out_file":"./logs/out.log",//自定义存放日志文件目录
        "log_date_format":"YYYY-MM-DD HH:mm:ss" //日志每一行标注时间
    }
}
```
配置后添加package.json命令

```js
{
"scripts":{
    "prod":"pm2 start pm2.config.json"
}
}

```

## 多进程

### 为何使用多进程

内存：操作系统会自动给单个node进程限制最大使用内存 （32位 1.6G）
cpu：无法充分利用多核cpu的优势

### 多进程之间存在的问题

多进程之间内存无法共享 （通过共享redis解决）