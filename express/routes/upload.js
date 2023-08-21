const express = require('express');
const router = express.Router();
const path = require('path');
const Busboy = require('busboy')
const fs = require('fs')

router.post('/imgs', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  let _fileName = ''
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const names = filename.filename.split('.')
    const preName = names[0] + '-';
    _fileName = new Date().getTime() + '.' + 'png'
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


module.exports = router;
