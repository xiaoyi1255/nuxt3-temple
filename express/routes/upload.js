const express = require('express');
const router = express.Router();
const path = require('path');
const Busboy = require('busboy')
const fs = require('fs')
// const heicConvert = require('heic-convert');

router.post('/imgs', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  let _fileName = ''
  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    const imgName = Buffer.from(filename.filename, "latin1").toString(
      "utf8"
    );
    const names = imgName.split('.')
    const preName = names[0] + '-';
    _fileName =preName + formatDateTime(new Date()) + '.' + names[1]
    const saveTo = path.join(__dirname, '../public/uploads/', _fileName);
    // if (names[1] == 'heic') {
    //   try {
    //     _fileName = new Date().getTime() + '.' + 'png'
    //     const saveTo = path.join(__dirname, '../public/uploads/', _fileName);
    //     // 创建一个数组，用于存储数据块
    //     const chunks = [];
    //     // 监听 'data' 事件来收集数据块
    //     file.on('data', (chunk) => {
    //       chunks.push(chunk);
    //     });

    //     file.on('end', async() => {
    //       const buffer = Buffer.concat(chunks);
    //       const pngBuffer = await heicConvert({
    //         buffer: buffer,
    //         format: 'PNG',
    //       });
    //       fs.writeFileSync(saveTo, pngBuffer);
    //     });
    //   } catch (error) {
    //     console.log(error)
    //   }
    //   return
    // }
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

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}`;
}

module.exports = router;
