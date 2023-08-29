const express = require('express');
const Busboy = require('busboy')
const path = require('path');
const fs = require('fs')
const multiparty = require("multiparty")
const router = express.Router();
const {
  formatDateTime,
  mkdirFolder,
  imageFormats,
  videoFormats,
  thunkStreamMerge,
  thunkStreamMergeProgress
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

router.post('/largeFile', (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err)
      res.json({
        code: 0,
        data: {},
      });
    } else {
      const savePath = path.join(__dirname, '../public/uploads/thunk/' + fields['filename'][0])
      fs.mkdirSync(savePath, {
        recursive: true,
      }); // 把每一次上传的切片数据进行统一的存储
      // 转存
      console.log(files['chunk'][0].path)
      console.log(fields['name'][0])
      fs.renameSync(
        files['chunk'][0].path,
        savePath + '/' +
          fields['name'][0]
      );
      res.json({
        code: 1,
        data: '上传切片成功',
      });
    }
  });
})

router.post('/mergeFile', (req, res) => {
  const { fileName , extName  } = req.query
  thunkStreamMerge(
    '../public/uploads/thunk/' + fileName,
    '../public/uploads/' + fileName + '.' + extName
  );
  res.json({
    code: 1,
    data: '/public/uploads/' + fileName + '.' + extName,
  });
})




module.exports = router;
