const fs = require('fs');
const path = require('path');

/**
 * 文件合并
 * @param {string} sourceFiles 源文件目录
 * @param {string} targetFile 目标文件路径
 */
function thunkStreamMerge(sourceFiles, targetFile) {
  const sourceFilesDir = path.join(__dirname, sourceFiles);
  targetFile = path.join(__dirname, targetFile);

  const fileList = fs
    .readdirSync(sourceFilesDir)
    .filter((file) => fs.lstatSync(path.join(sourceFilesDir, file)).isFile())
    .sort((a, b) => parseInt(a.split('@')[1]) - parseInt(b.split('@')[1]))
    .map((name) => ({
      name,
      filePath: path.join(sourceFilesDir, name),
    }));

  const fileWriteStream = fs.createWriteStream(targetFile);

  thunkStreamMergeProgress(fileList, fileWriteStream, sourceFilesDir);
}

/**
 * 合并每一个切片
 * @param {Array} fileList 文件数据列表
 * @param {WritableStream} fileWriteStream 最终的写入结果流
 * @param {string} sourceFilesDir 源文件目录
 */
function thunkStreamMergeProgress(fileList, fileWriteStream, sourceFilesDir) {
  if (!fileList.length) {
    fileWriteStream.end('完成了');
    // 删除临时目录
    fs.rmdirSync(sourceFilesDir, { recursive: true, force: true });
    return;
  }

  const { filePath: chunkFilePath } = fileList.shift();
  const currentReadStream = fs.createReadStream(chunkFilePath);

  // 把结果往最终的生成文件上进行拼接
  currentReadStream.pipe(fileWriteStream, { end: false });

  currentReadStream.on('end', () => {
    // 拼接完之后进入下一次循环
    thunkStreamMergeProgress(fileList, fileWriteStream, sourceFilesDir);
  });
}

module.exports = {
    thunkStreamMerge
}