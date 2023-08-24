const express = require('express');
const Busboy = require('busboy')
const cron = require('node-cron');
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
    _fileName = formatDateTime(new Date()) +   '-'  + names[0] +'.' + names[1]
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
