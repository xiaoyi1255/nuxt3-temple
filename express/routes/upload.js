const express = require('express');
const router = express.Router();
const path = require('path');
const Busboy = require('busboy')
const fs = require('fs')
const heicConvert = require('heic-convert');

router.post('/imgs', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  let _fileName = ''
  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    const names = filename.filename.split('.')
    const preName = names[0] + '-';
    _fileName = new Date().getTime() + '.' + names[1]
    const saveTo = path.join(__dirname, '../public/uploads/', _fileName);
    if (names[1] == 'heic') {
      console.log(file, '11')
      try {
        _fileName = new Date().getTime() + '.' + 'png'
        const saveTo = path.join(__dirname, '../public/uploads/', _fileName);
        // 创建一个数组，用于存储数据块
        const chunks = [];
        // 监听 'data' 事件来收集数据块
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        // 监听 'end' 事件，在文件读取完毕后处理数据
        file.on('end', async() => {
          // 将收集到的数据块合并为一个 Buffer
          const buffer = Buffer.concat(chunks);
          
          // 现在 buffer 就是包含文件内容的 Buffer
          console.log(buffer);
          const pngBuffer = await heicConvert({
            buffer: buffer,
            format: 'PNG',
          });
          fs.writeFileSync(saveTo, pngBuffer);
        });
      } catch (error) {
        console.log(error)
      }
    } else {
      file.pipe(fs.createWriteStream(saveTo));
    }

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

async function fileToBuffer(file) {
  const chunks = [];
  for await (const chunk of file) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = router;
