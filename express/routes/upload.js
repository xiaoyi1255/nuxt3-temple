const express = require('express');
const Busboy = require('busboy')
const path = require('path');
const fs = require('fs')
// const multiparty = require("multiparty")
const router = express.Router();
const {
  formatDateTime,
  mkdirFolder,
  imageFormats,
  videoFormats,
  creatTime
} = require('../utils/index.js')

creatTime(20) // 清理数据

/**
 * 普通文件上传 50M 以内
 */
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

/**
 * 大文件上传： 分片
 */
router.post('/largeFile', (req, res) => {
  console.log(req.ip, 'ip')
  const busboy = Busboy({ headers: req.headers });
  const { filename, name } = req.query
  busboy.on('file', (req, (err, file, filds, encoding, mimetype) => {
    try {
      const dir = `../public/file/thunk/${name}`
      const saveTo = path.join(__dirname, dir, filename);
      mkdirFolder(dir)
      console.log(saveTo)
      file.pipe(fs.createWriteStream(saveTo));
    } catch (error) {
      console.log(error, 'err*---------')
      const resObj = {
        msg: '分片上传失败',
        code: -1,
        err: error
      }
      res.send(resObj);
    }
  }));
  busboy.on('finish', function () {
    const resObj = {
      msg: '分片上传成功',
      code: 0,
    }
    res.send(resObj);
  });
  return req.pipe(busboy);
})

/**
 * 大文件
 */
router.post('/mergeFile', (req, res) => {
  const { fileName, extName } = req.query
  thunkStreamMerge(
    '../public/file/thunk/' + fileName,
    '../public/file/' + fileName + '.' + extName
  );
  let fileType = extName
  if (imageFormats.includes(extName)) {
    fileType = 'img'
  } else if (videoFormats.includes(extName)) {
    fileType = 'video'
  }
  res.json({
    code: 1,
    url: '/static/file/' + fileName + '.' + extName,
    fileType,
    fileName
  });
})


/**
 * 文件合并
 * @param {*} sourceFiles 源文件
 * @param {*} targetFile  目标文件
 */
function thunkStreamMerge(sourceFiles, targetFile) {
  const thunkFilesDir = sourceFiles
  targetFile = path.join(__dirname, targetFile);
  const _thunkFilesDir = path.join(__dirname, sourceFiles);
  const list = fs.readdirSync(_thunkFilesDir);
  const fileList = list
    .sort((a, b) => a.split('@')[1] * 1 - b.split('@')[1] * 1)
    .map((name) => ({
      name,
      filePath: path.join(__dirname, thunkFilesDir, name),
    }));
  const fileWriteStream = fs.createWriteStream(targetFile);
  thunkStreamMergeProgress(fileList, fileWriteStream, _thunkFilesDir);
}

/**
 * 合并每一个切片
 * @param {*} fileList        文件数据
 * @param {*} fileWriteStream 最终的写入结果
 * @param {*} sourceFiles     文件路径
 */
function thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles) {
  try {
    if (!fileList.length) {
      fileWriteStream.end('完成了');
      // 删除临时目录
      if (sourceFiles) {
        fs.rmdirSync(sourceFiles, { recursive: true, force: true });
      }
      return;
    }
    const data = fileList.shift(); // 取第一个数据
    const { filePath: chunkFilePath } = data;
    const currentReadStream = fs.createReadStream(chunkFilePath); // 读取文件
    // 把结果往最终的生成文件上进行拼接
    currentReadStream.pipe(fileWriteStream, { end: false });
    currentReadStream.on('end', () => {
      // 拼接完之后进入下一次循环
      thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles);
    });
  } catch (error) {
    console.log(error)
  }
}

module.exports = router;
