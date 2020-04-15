const fs = require('fs')
const path = require('path')
/* formidable用于解析表单数据，特别是文件上传 */
const formidable = require('formidable')
/* 用于时间格式化 */

module.exports = (req, res) => {
    /* 创建上传表单 */
  let form = new formidable.IncomingForm()
  /* 设置编码格式 */
  form.encoding = 'utf-8'
  form.uploadDir = path.join(__dirname, './public/upload')
  /* 保留文件后缀名 */
  form.keepExtensions = true
  /* 设置文件大小 */
  form.maxFieldsSize = 2 * 1024 *1024

  form.parse(req, (err, fields, files) => {
    let file = files.file
    /* 如果出错，则拦截 */
    console.log(file)
    if(err) {
      return res.end({'status': 500, msg: '服务器内部错误', result: ''})
    }
    if(file.size > form.maxFieldsSize) {
        fs.unlink(file.path)
        return res.end({'status': -1, 'msg': '图片不能超过2M', result: ''})
      } /* 存储后缀名 */


    let num = Math.floor(Math.random() * 8999 + 10000)
    const extName =file.name.split('.')[file.name.split('.').length-1]
    let imageName = `${num}.${extName}`
    fs.rename(file.path,form.uploadDir + '/'+ imageName, (err) => {
     
        res.setHeader('Content-type','application/json')
        if(err) {
            res.end(JSON.stringify({'status': -1, 'msg': '图片上传失败', result: ''}))
        } else {
            res.end(JSON.stringify({'status': 200, 'msg': '图片上传成功', result: {url: `http://localhost:3000/upload/${imageName}`}}))
        }
      })
  })
  
}