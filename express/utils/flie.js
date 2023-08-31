const fs = require('fs');
const path = require('path');

/**
 * 查看是否已包含某个文件
 * @param {*} targetFileName 查找的目标文件名
 * @param {*} folderPath 文件夹路径 默认 /public/file/
 * @returns 
 */
function checkFileExistsInFolder(targetFileName, folderPath = '../public/file/') {
    folderPath = path.join(__dirname, folderPath)
    const filesInFolder = fs.readdirSync(folderPath);
    const isUpoaded = filesInFolder.includes(targetFileName)
    console.log('文件是否已存在', isUpoaded)
    return isUpoaded;
}

/**
 * 检查某个文件夹是否存在
 * @param {*} folderPath 文件夹路径
 * @returns 文件夹内的所有文件
 */
function getFilesInFolder(folderPath) {
    try {
        folderPath = path.join(__dirname, folderPath)
        if (!fs.existsSync(folderPath)) {
            console.log(`Folder '${folderPath}' does not exist.`);
            return [];
        }
        const filesInFolder = fs.readdirSync(folderPath) || [];
        return filesInFolder;
    } catch (error) {
        return []
    }
}

module.exports = {
    getFilesInFolder,
    checkFileExistsInFolder,
}