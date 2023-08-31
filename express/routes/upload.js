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
  creatTime,
} = require('../utils/index.js')
const { checkFileExistsInFolder, getFilesInFolder } = require('../utils/flie.js');
const { thunkStreamMerge } = require('../utils/upload.js')


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
  const busboy = Busboy({ headers: req.headers });
  const { filename, name, index } = req.query
  busboy.on('file', (req, (err, file, filds, encoding, mimetype) => {
    try {
      const dir = `../public/file/thunk/${name}`
      mkdirFolder(dir)
      const saveTo = path.join(__dirname, dir, filename);
      file.pipe(fs.createWriteStream(saveTo));
    } catch (error) {
      console.log(error, 'err*---------')
      const resObj = {
        msg: '分片上传失败',
        code: -1,
        err: error,
        index // 返回报错的是那个chunks
      }
      res.send(resObj);
    }
  }));
  busboy.on('finish', function () {
    const resObj = {
      msg: '分片上传成功',
      code: 0,
      index,
    }
    res.send(resObj);
  });
  return req.pipe(busboy);
})

/**
 * 合并分片
 */
router.post('/mergeFile', async (req, res) => {
  const { fileName, extName, filename } = req.query
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
    url: '/static/file/' + fileName + "." + extName,
    fileType,
    fileName
  });
})

/**
 * 校验文件是否已上传
 * 1. 静态服务上是否存在该文件 存在=》返回url
 * 2. 不存在改文件
 *    1）是否存在已上传的部分chunks 存在，返回还未上传的chunks 名列表
 */
router.post('/verifyFile', async (req, res) => {
  const {
    fileName,
    extName,
    chunksObj=''
  } = req.query
  console.log(JSON.parse(chunksObj))
  const { name = '', chunsNames= [] } = JSON.parse(chunksObj || '{}') || {}
  let notUploadedChunks = [] // 未上传的chunks名列表
  let chunksFiles = []
  const isSave = checkFileExistsInFolder(fileName)
  if (!isSave && name) { // 文件不存在 接着检查是否存在已上传的chunks
    chunksFiles = getFilesInFolder(`../public/file/thunk/${name}`) || []
    if (chunksFiles?.length && chunsNames?.length) {
      notUploadedChunks = chunsNames.filter(item => !chunksFiles.includes(item))
    }
  }
  let fileType = extName
  if (imageFormats.includes(extName)) {
    fileType = 'img'
  } else if (videoFormats.includes(extName)) {
    fileType = 'video'
  }
  const url = isSave ?  '/static/file/' + fileName : ''
  res.status(200).send({
    code: 0,
    fileType,
    fileName,
    notUploadedChunks,
    uploadedChunks: chunksFiles,
    url
  })
})


module.exports = router;
