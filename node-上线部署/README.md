# 线上环境

## 需要注意的点

- 服务器稳定性
- 充分利用服务器硬件资源，以便提高性能
- 线上日志记录

## pm2

### 基本功能

- 集成守护，系统崩溃自动重启
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