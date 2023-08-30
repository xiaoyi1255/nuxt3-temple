const fs = require('fs');
const path = require('path');

/**
 * 查看是否已包含某个文件
 * @param {*} targetFileName 查找的目标文件名
 * @param {*} folderPath 文件夹路径 默认 /public/file/
 * @returns 
 */
function checkFileExistsInFolder(targetFileName, folderPath='../public/file/') {
    folderPath = path.join(__dirname, folderPath)
    const filesInFolder = fs.readdirSync(folderPath);
    const isUpoaded = filesInFolder.includes(targetFileName)
    console.log('文件是否已存在', isUpoaded)
    return isUpoaded;
}


// 使用
// const folderPath = '../public/file/'; // 替换为你的文件夹路径
// const targetFileName = '5d08ced39910341325c102af785beb54'; // 替换为你要查找的目标文件名

// const fileExists = checkFileExistsInFolder(folderPath, targetFileName);

// if (fileExists) {
//     console.log(`File '${targetFileName}' exists in the folder.`);
// } else {
//     console.log(`File '${targetFileName}' does not exist in the folder.`);
// }

module.exports = {
    checkFileExistsInFolder
}