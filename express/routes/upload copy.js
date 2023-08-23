const express = require('express');
const Busboy = require('busboy')
const router = express.Router();
const path = require('path');
const fs = require('fs')

router.post('/imgs', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  let _fileName = ''
  mkdirFolder()
  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    // 对文件名进行处理
    const imgName = filename.filename || Buffer.from(filename.filename, "latin1").toString("utf8");
    const names = imgName.split('.')
    _fileName =  names[0] + '-' + formatDateTime(new Date()) + '.' + names[1]
    const saveTo = path.join(__dirname, '../public/uploads/', _fileName);
    file.pipe(fs.createWriteStream(saveTo));
  });

  busboy.on('finish', function () {
    const resObj = {
      msg: '发送成功',
      url: '/static/uploads/' + _fileName
    }
    console.log('文件上传：', _fileName)
    res.send(resObj);
  });
  return req.pipe(busboy);
});

/**
 * 
 * @param {*} date 时间对象
 * @returns 年月日时分
 */
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}`;
}

/**
 * 判断文件夹是否存在、不存在则创建
 * @param {*} name 判断的文件夹
 */
function mkdirFolder(name='../public/uploads/') {

  const folderPath = path.join(__dirname, name);

  // 判断文件夹是否存在
  if (!fs.existsSync(folderPath)) {
    // 如果文件夹不存在，则创建它
    fs.mkdirSync(folderPath);
    console.log('文件夹已创建');
  } else {
    console.log('文件夹已存在');
  }

}
module.exports = router;
