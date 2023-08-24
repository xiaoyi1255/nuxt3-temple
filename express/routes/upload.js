const express = require('express');
const Busboy = require('busboy')
const cron = require('node-cron');
const path = require('path');
const fs = require('fs')
const router = express.Router();
const {
  formatDateTime,
  mkdirFolder,
  imageFormats,
  videoFormats
} = require('../utils/index.js')


router.post('/imgs', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  let _fileName = ''
  let fileType = ''
  mkdirFolder()
  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    // 对文件名进行处理
    const imgName = Buffer.from(filename.filename, "latin1").toString("utf8");
    const names = imgName.split('.')
    _fileName = formatDateTime(new Date()) + '-' + names[0] + '.' + names[1]
    if (imageFormats.includes(names[1])) {
      fileType = 'img'
    } else if (videoFormats.includes(names[1])) {
      fileType = 'video'
    }
    const saveTo = path.join(__dirname, '../public/uploads/', _fileName);
    file.pipe(fs.createWriteStream(saveTo));
  });

  busboy.on('finish', function () {
    const resObj = {
      msg: '发送成功',
      url: '/static/uploads/' + _fileName,
      fileType
    }
    console.log('文件上传：', _fileName)
    res.send(resObj);
  });
  return req.pipe(busboy);
});


// 定时任务，每天的凌晨执行
cron.schedule('0 0 * * *', () => { // '*/10 * * * * * 10秒
  const targetFolderPath = path.join(__dirname, '../public/uploads'); // 替换为目标文件夹的路径
  try {
    fs.readdir(targetFolderPath, (err, files) => {
      if (err) {
        console.error('Error:', err);
        return;
      }

      // 对文件按照创建时间进行排序
      files.sort((a, b) => {
        const filePathA = path.join(targetFolderPath, a);
        const filePathB = path.join(targetFolderPath, b);

        const statsA = fs.statSync(filePathA);
        const statsB = fs.statSync(filePathB);

        return statsA.ctime.getTime() - statsB.ctime.getTime();
      });
      // const files = fs.readdirSync(targetFolderPath);

      files.forEach(file => {
        const filePath = path.join(targetFolderPath, file);
        try {
          const stats = fs.statSync(filePath);
          const fileSizeInBytes = stats.size;
          const fileSizeInGB = fileSizeInBytes / (1024 * 1024 * 1024);
          if (fileSizeInGB > 2) {
            fs.unlinkSync(filePath); // 删除文件
            console.log('File deleted:', filePath);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
});



module.exports = router;
