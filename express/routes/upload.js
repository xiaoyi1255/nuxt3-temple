const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 设置图片上传的目标目录
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/imgs')); // 设置图片保存路径为 public/imgs
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  console.log('上传图片。。。', req)
  // req.file 是上传的文件对象
  // 处理图片保存和生成链接的逻辑
});


module.exports = router;
