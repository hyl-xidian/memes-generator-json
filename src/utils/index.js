const fs = require('fs');
const path = require('path');
/**
 * 获得目标路径下的所有文件名
 * @param {string} filePath 相对于根目录的路径 
 * @returns {Array<String>} 文件名列表
 */
function getFilesList(filePath) {
    return fs.readdirSync(path.resolve(__dirname, `../../${filePath}`));
}
/**
 * 写入文件
 * @param {string} targetPath 目标路径: 相对于根目录的路径
 * @param {string} content 文件内容
 * @param {string} targetFolder 目标所在的文件夹
 */
function writeToFile(targetPath, content, targetFolder) {
    targetPath = "../../" + targetPath;
    const absoluePath = path.resolve(__dirname, targetPath);
    const isExist = fs.existsSync(absoluePath);
    const targetDir = path.resolve(__dirname, `../../${targetFolder}`);
    if (targetFolder != null &&!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }
    if (isExist) {
        fs.unlinkSync(path.resolve(__dirname, targetPath));
    }
    fs.writeFileSync(
        absoluePath,
        content
    );
}
/**
 * 返回数字的汉字写法
 * @param {int} num 阿拉伯数字
 * @returns {string} 汉字大写
 */
function convertToChinaNum(num) {
    var arr1 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    var arr2 = ['', '十', '百', '千']
    if (!num || isNaN(num)) {
        return "零";
    }
    var english = num.toString().split("")
    var result = "";
    for (var i = 0; i < english.length; i++) {
        var des_i = english.length - 1 - i;//倒序排列设值
        result = arr2[i] + result;
        var arr1_index = english[des_i];
        result = arr1[arr1_index] + result;
    }
    //将【零千、零百】换成【零】 【十零】换成【十】
    result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
    //合并中间多个零为一个零
    result = result.replace(/零+/g, '零');
    //移除末尾的零
    result = result.replace(/零+$/, '');
    //将【一十】换成【十】
    result = result.replace(/^一十/g, '十');
    return result;
}

module.exports = { getFilesList, writeToFile, convertToChinaNum }