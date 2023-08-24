const path = require('path');
const fs = require('fs')


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

module.exports = {
    formatDateTime,
    mkdirFolder,
    imageFormats,
    videoFormats,
}