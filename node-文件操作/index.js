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
 
fs.writeFileSync('./a.txt','同步写入',{
    encoding:'utf-8',
    'flag':'a'
})

fs.appendFile('./a.txt','追加写入', {
    encoding:'utf-8'
},(err) => {
    var data = fs.readFileSync('./a.txt','utf-8')
    console.log(data)
})