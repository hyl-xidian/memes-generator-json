const nunjucks = require('nunjucks');
const { getFilesList, writeToFile, convertToChinaNum } = require('./utils/index');
const config = require('../config');
const shell = require('shelljs');
const path = require('path');

var basePath=__dirname + "/../";
function createEnv(path, opts) {
    var
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(`${basePath}./template`, {
                noCache: noCache,
                watch: watch,
            }), {
            autoescape: autoescape,
            throwOnUndefined: throwOnUndefined
        });
    if (opts.filters) {
        for (var f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

var env = createEnv(`${basePath}./template`, {
    watch: true,
    filters: {
        hex: function (n) {
            return '0x' + n.toString(16);
        }
    }
});


if (getFilesList('./imgs').length < 1) {
    console.log("Error: 请在'/imgs'中至少放入一组表情包");
    process.exit(1);
}

// 判断相关文件夹是否存在，不存在则创建
shell.mkdir('-p', `${basePath}./memes`, `${basePath}./imgs`);
if (config['isGenStatic'] == true) {
    shell.mkdir('-p', `${basePath}./static`);
} else {
    shell.rm('-rf', `${basePath}./static`);
}

if (config['isGenStatic'] == true) {
    // 开始渲染主页
    let chinaNumsOfMeme = convertToChinaNum(config['memes'].length);
    let rootIndexContent = env.render('root_index.html',
        {
            memeList: config['memes'],
            memeNum: chinaNumsOfMeme
        });
    // 保存index.html
    var rootIndexPath = './static/index.html';
     // 先删除static内的文件
    shell.rm('-rf', `${basePath}./static/*`);
    writeToFile(rootIndexPath, rootIndexContent, './static');
}

var jsonUrlInfo = "";

// 渲染每个表情包的主页和json文件
config['memes'].forEach((item) => {
    // 获取当前表情包下所有的图片
    let imageList = getFilesList(`./imgs/${item.path}`);
    // 渲染生成当前表情包的各种格式的json文件
    // 目前支持owo格式和Artalk格式的
    let jsonList = getFilesList('./template/json');
    jsonList.forEach((jsonTemplate) => {
        let childJsonContent = env.render(`./json/${jsonTemplate}`,
            {
                memeName: item.name,
                imageUrlList: imageList,
                baseUrl: item.baseUrl,
                memePath: item.path
            }
        );
        let childJsonPath = `./memes/${item.path}/${item.path}_${jsonTemplate}`;
        writeToFile(childJsonPath, childJsonContent, `./memes/${item.path}`);
        let cur = `"${item.name}"表情包的${jsonTemplate.split('.')[0]}格式的Json文件链接为: \n${item.baseUrl}/memes/${item.path}/${item.path}_${jsonTemplate}\n`;
        console.log(cur);
        jsonUrlInfo += cur;
    });

    if (config['isGenStatic'] == true) {
        // 渲染当前表情包的主页
        let childIndexContent = env.render('./child_index.html',
            {
                memeName: item.name,
                imageUrlList: imageList,
                memePath: item.path,
                allTypes: jsonList
            }
        );
        let childIndexPath = `./memes/${item.path}/index.html`;
        writeToFile(childIndexPath, childIndexContent, `./memes/${item.path}`);
    }
});
// 保存表情包json文件的url链接信息
writeToFile("./json_url_info.txt", jsonUrlInfo);

// 如果生成静态网站，则将相应文件复制过去
if (config['isGenStatic'] == true) {
    shell.cp('-r', `${basePath}./imgs`, `${basePath}./static/`);
    shell.cp('-r', `${basePath}./memes`, `${basePath}./static/`);
    shell.cp(`${basePath}./template/404.html`, `${basePath}./static/404.html`);
}

// 退出
process.exit(0);