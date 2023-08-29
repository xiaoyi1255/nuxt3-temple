const path = require('path');
const fs = require('fs')
const cron = require('node-cron');


const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'heic', 'heif'];
const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'ogg']

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
function mkdirFolder(name = '../public/uploads/') {

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

function creatTime() {
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
  
}

/**
 * 文件合并
 * @param {*} sourceFiles 源文件
 * @param {*} targetFile  目标文件
 */
function thunkStreamMerge(sourceFiles, targetFile) {
    const thunkFilesDir = sourceFiles
    targetFile = path.join(__dirname, targetFile) ;
    const _thunkFilesDir = path.join(__dirname, sourceFiles) ;
    console.log(thunkFilesDir, '============')
    const list = fs.readdirSync(_thunkFilesDir); // 读取目录中的文件
    const fileList = list
      .sort((a, b) => a.split('@')[0] * 1 - b.split('@')[0] * 1)
      .map((name) => ({
        name,
        filePath: path.resolve(thunkFilesDir, name),
      }));
    const fileWriteStream = fs.createWriteStream(targetFile);
    thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles);
  }
  
  /**
   * 合并每一个切片
   * @param {*} fileList        文件数据
   * @param {*} fileWriteStream 最终的写入结果
   * @param {*} sourceFiles     文件路径
   */
  function thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles) {
    if (!fileList.length) {
      // thunkStreamMergeProgress(fileList)
      fileWriteStream.end('完成了');
      // 删除临时目录
      if (sourceFiles)
        fs.rmdirSync(sourceFiles, { recursive: true, force: true });
      return;
    }
    const data = fileList.shift(); // 取第一个数据
    const { filePath: chunkFilePath } = data;
    const currentReadStream = fs.createReadStream(chunkFilePath); // 读取文件
    // 把结果往最终的生成文件上进行拼接
    currentReadStream.pipe(fileWriteStream, { end: false });
    currentReadStream.on('end', () => {
      // console.log(chunkFilePath);
      // 拼接完之后进入下一次循环
      thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles);
    });
  }

module.exports = {
    formatDateTime,
    mkdirFolder,
    imageFormats,
    videoFormats,
    thunkStreamMerge,
    thunkStreamMergeProgress

}