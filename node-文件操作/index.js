 const fs = require('fs')
 const path = require('path')

//  fs.readFile('./a.txt','utf-8',function(err, data) {
//      console.log(JSON.parse(data))
//  })
//  const content =  fs.readFileSync('./a.txt','utf-8')
//  console.log('content:', content)

//  fs.writeFile('./a.txt','异步写入', {
//     encoding:'utf-8',
//     'flag':'a'
// },function(err, data) {
//     console.log('异步写入成功')
// })
 
// fs.writeFileSync('./a.txt','同步写入',{
//     encoding:'utf-8',
//     'flag':'a'
// })

// fs.appendFile('./a.txt','追加写入', {
//     encoding:'utf-8'
// },(err) => {
//     var data = fs.readFileSync('./a.txt','utf-8')
//     console.log(data)
// })
// fs.copyFile('./a.txt','./copy.txt',err=> {
//     if(err) {
//         console.log('拷贝发生错误')
//         return
//     }
//     console.log('拷贝完成')
// })
fs.unlink('./copy.txt',(err) => {
    if(err) {
        console.log(err)
        return
    }
    console.log('删除成功')
})