# Memes Json Generator

## 这是什么？
一个基于Nunjucks模板引擎的表情包Json文件生成器

生成的Json文件可用于Artalk、Twikoo等评论系统，增加发送表情包功能

另外，运行`app.js`后还会 自动生成 用于展示表情包的静态网站，相关文件在`/static`中

[我搭建的表情包展示网站](https://meme-repo.pages.dev)

## 为什么？

> **为了减少重复工作**

最近在[个人博客](https://floatu.top)中引入了`Artalk`评论系统，该系统支持自定义表情包，可以在发送评论时使用。

`Artalk`以特定的`Json`格式导入表情包，例如：
```js
emoticons: [{
    "name": "颜表情",
    "type": "emoticon", // 字符类型
    "items": [
        { "key": "Hi", "val": "|´・ω・)ノ" },
        { "key": "开心", "val": "ヾ(≧∇≦*)ゝ" },
        //...
    ]
}, {
    "name": "滑稽",
    "type": "image", // 图片类型
    "items": [
        {
            "key": "原味稽",
            "val": "<图片 URL>"
        },
        //...
    ]
}],
```

为了减少工作量，我编写了这个简单的生成器，可以一键生成受支持的`Json`文件

## 如何使用？

第一步，将需要引入的一组表情包放在`imgs`文件夹下。命名示例：`imgs/huaji/`

第二步，在配置文件[config.js](#配置文件)中增加条目

第二步，执行`node src/app.js`，会在`/memes/`文件下生成`Json`文件

输出：

```text
./memes
└── huaji
    ├── huaji_artalk.json
    ├── huaji_owo.json
    └── index.html
```

---

如果你希望生成用于展示表情包的静态网站，可以在配置文件`config.js`中开启，`"isGenStatic": "true`，执行`node src/app.js`后，会在`static`目录下生成网站文件

```text
./static
├── 404.html
├── imgs
│   └── huaji
│       ├── huaji.gif
│       ├── huaji1.jpg
│       ├── huaji10.png
│       └── ...
├── index.html
└── memes
    └── huaji
        ├── huaji_artalk.json
        ├── huaji_owo.json
        └── index.html

```

然后直接将`static`文件夹部署到服务器，或者[Netlify](https://www.netlify.com/), [Cloudflare Pages](https://pages.cloudflare.com/), [Vercel](https://vercel.com/), [Weblify](https://cloud.tencent.com/product/webify), [Aliyun OSS](https://www.aliyun.com/product/oss)等托管服务上即可

首页效果
<p style="text-align:center"><img src="http://imgs.floatu.top/i/2022/07/28/WOykrf-2.png" alt="主页" style="width:300px;" /></p>

具体表情包页面
<p style="text-align:center"><img src="http://imgs.floatu.top/i/2022/07/28/ZylMuV-2.png" alt="表情包页面" style="width:250px;" /></p>


## 项目结构

该项目结构比较简单，主要由一个模板目录、一个代码目录和一个配置文件组成

> 注意：本项目使用的表情包来自于[2X-ercha/Twikoo-Magic](https://github.com/2X-ercha/Twikoo-Magic)

```text
./src
├── app.js  // 主程序
└── utils
    └── index.js    // 工具类
./template
├── 404.html    // 404 页面
├── child_index.html // 具体表情包主页的模板
├── json
│   ├── artalk.json // Artalk格式的json文件模板
│   └── owo.json    // owo格式的json文件模板
└── root_index.html // 网站主页的模板
config.js   // 配置文件
```

## 配置文件

`baseUrl`中填写表情包存储的「根路径」

如果将`/static`文件夹上传到`Cloudflare pages`，域名为`https://meme-repo.pages.dev`，则

``"baseUrl": "https://meme-repo.pages.dev"``

而相应滑稽表情包的存储路径为 ``https://meme-repo.pages.dev/memes/huaji/xxx.png``


```js
module.exports = {
    "isGenStatic": true,
    "memes": [
        {
            path: 'huaji',
            // 表情包的根路径
            baseUrl: 'https://meme-repo.pages.dev', // 结尾不要带'/'
            // 表情包名称
            name: '滑稽'
        },
        ...    
    ]
}

```

## 进阶

### 自定义模板

> 本项目基于Nunjucks模板引擎开发，具体使用参照[官方文档](https://mozilla.github.io/nunjucks/templating.html)，简单易上手
>
> Ps: Hexo的Next主题就是基于Nunjucks编写的

用`Artalk`官方支持的格式举例：
```js
emoticons: [{
    "name": "颜表情",
    "type": "emoticon", // 字符类型
    "items": [
        { "key": "Hi", "val": "|´・ω・)ノ" },
        { "key": "开心", "val": "ヾ(≧∇≦*)ゝ" },
        //...
    ]
}, {
    "name": "滑稽",
    "type": "image", // 图片类型
    "items": [
        {
            "key": "原味稽",
            "val": "<图片 URL>"
        },
        //...
    ]
}],

```

`njk`模板长这样

```json
{
    "name": "{{ memeName }}",
    "type": "image",
    "items": [
        {% set comma = joiner() %}  // joiner 参见文档 https://mozilla.github.io/nunjucks/templating.html#joiner-separator
        {% for item in imageUrlList %}  // 循环
        {{ comma() }}   // 引入
        {
            "key": "{{ item.split('.')[0] }}",
            "val": "{{ baseUrl }}/imgs/{{ memePath }}/{{ item }}"
        }
        {% endfor %}
    ]
}

```
`json`的`njk`模板有四个传入参数: 
- `memeName`：表情包名称
- `imageUrlList`：该组表情包下的「图片名字列表」（带拓展名）
- `baseUrl`：图片的链接前缀
- `memePath`：表情包存储的路径。例如，滑稽表情包为huaji，可自由设置

## 后话

这是我第一次使用`javascript`，不太熟练，若有指教，欢迎提issue或者发邮件讨论，感谢赐教！