import projectConfig from '/pagic.config.js';
var _a, _b;
export default {
    'prev': {
        "title": "插件",
        "link": "docs/plugins.html"
    },
    'next': {
        "title": "示例网站",
        "link": "docs/demos.html"
    },
    'sidebar': [
        {
            "title": "介绍",
            "link": "docs/introduction.html",
            "pagePath": "docs/introduction.md"
        },
        {
            "title": "基本用法",
            "link": "docs/usage.html",
            "pagePath": "docs/usage.md"
        },
        {
            "title": "配置文件",
            "link": "docs/config.html",
            "pagePath": "docs/config.md"
        },
        {
            "title": "页面内容",
            "link": "docs/content.html",
            "pagePath": "docs/content.md"
        },
        {
            "title": "_layout.tsx",
            "link": "docs/layout.html",
            "pagePath": "docs/layout.md"
        },
        {
            "title": "主题",
            "link": "docs/themes.html",
            "pagePath": "docs/themes.md"
        },
        {
            "title": "插件",
            "link": "docs/plugins.html",
            "pagePath": "docs/plugins.md"
        },
        {
            "title": "部署",
            "link": "docs/deployment.html",
            "pagePath": "docs/deployment.md"
        },
        {
            "title": "示例网站",
            "link": "docs/demos.html",
            "pagePath": "docs/demos.md"
        },
        {
            "title": "局限性",
            "link": "docs/limitations.html",
            "pagePath": "docs/limitations.md"
        }
    ],
    config: { "root": "/", ...projectConfig, ...(_b = (_a = projectConfig.i18n) === null || _a === void 0 ? void 0 : _a.overrides) === null || _b === void 0 ? void 0 : _b['undefined'] },
    'pagePath': "docs/deployment.md",
    'layoutPath': "_layout.tsx",
    'outputPath': "docs/deployment.html",
    'title': "部署",
    'content': React.createElement("article", { dangerouslySetInnerHTML: {
            __html: '<h1>部署</h1>\n<p>构建完成后的 <code>dist</code> 目录可以作为一个网站部署到你的服务器上。我们强烈推荐通过持续集成让部署过程自动化，下面列出几种常见的部署方式：</p>\n<h2 id="github-pages">GitHub Pages<a class="anchor" href="#github-pages">§</a></h2>\n<p>GitHub Pages 是最常见的一种托管静态网站的服务，通过 GitHub 官方提供的 CI 工具 <a href="https://github.com/features/actions">GitHub Actions</a>，我们可以轻松的实现提交代码后自动构建并部署网站。</p>\n<p>实现自动部署网站到 GitHub Pages 非常简单，只需要在你的 GitHub 项目中创建一个 <code>.github/workflows/ci.yml</code> 文件，内容如下：</p>\n<pre class="language-yml"><code class="language-yml"><span class="token key atrule">name</span><span class="token punctuation">:</span> gh<span class="token punctuation">-</span>pages\n\n<span class="token key atrule">on</span><span class="token punctuation">:</span>\n  <span class="token key atrule">push</span><span class="token punctuation">:</span>\n    <span class="token key atrule">branches</span><span class="token punctuation">:</span>\n      <span class="token punctuation">-</span> master\n\n<span class="token key atrule">jobs</span><span class="token punctuation">:</span>\n  <span class="token key atrule">build-and-deploy</span><span class="token punctuation">:</span>\n    <span class="token key atrule">runs-on</span><span class="token punctuation">:</span> ubuntu<span class="token punctuation">-</span><span class="token number">18.04</span>\n    <span class="token key atrule">steps</span><span class="token punctuation">:</span>\n      <span class="token punctuation">-</span> <span class="token key atrule">uses</span><span class="token punctuation">:</span> actions/checkout@v2\n\n      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Setup deno\n        <span class="token key atrule">uses</span><span class="token punctuation">:</span> denolib/setup<span class="token punctuation">-</span>deno@v2\n        <span class="token key atrule">with</span><span class="token punctuation">:</span>\n          <span class="token key atrule">deno-version</span><span class="token punctuation">:</span> v1.2.3\n\n      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Build gh<span class="token punctuation">-</span>pages\n        <span class="token key atrule">run</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string"></span>\n          curl -fsSL https://deno.land/x/install/install.sh | sh\n          export DENO_INSTALL="/home/runner/.deno"\n          export PATH="$DENO_INSTALL/bin:$PATH"\n          deno --version\n          deno install --unstable --allow-read --allow-write --allow-net -n pagic https://deno.land/x/pagic@v0.9.8/mod.ts\n          <span>pagic build</span>\n\n      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Deploy gh<span class="token punctuation">-</span>pages\n        <span class="token key atrule">uses</span><span class="token punctuation">:</span> peaceiris/actions<span class="token punctuation">-</span>gh<span class="token punctuation">-</span>pages@v3\n        <span class="token key atrule">with</span><span class="token punctuation">:</span>\n          <span class="token key atrule">github_token</span><span class="token punctuation">:</span> $<span class="token punctuation">{</span><span class="token punctuation">{</span> secrets.GITHUB_TOKEN <span class="token punctuation">}</span><span class="token punctuation">}</span>\n          <span class="token key atrule">publish_dir</span><span class="token punctuation">:</span> ./dist\n<span class="highlighted-line">          <span class="token key atrule">cname</span><span class="token punctuation">:</span> ts.xcatliu.com</span></code></pre><p>注意替换掉最后一行的 <code>ts.xcatliu.com</code> 为你自己的域名。</p>\n<p>如果没有自己的域名的话，也可以使用 GitHub 提供的免费域名 <code>xxx.github.io</code>，此时只要将最后一行删除即可。注意此时可能需要修改 <code>pagic.config.ts</code> 中的 <code>root</code> 配置来支持子路径，详细可参考<a href="./config.html#root">配置文件</a>章节。</p>\n<h2 id="cloudbase">CloudBase<a class="anchor" href="#cloudbase">§</a></h2>\n<p><a href="https://www.cloudbase.net/">云开发 CloudBase</a> 是腾讯云提供的云原生一体化开发环境和工具平台，现<a href="https://cloud.tencent.com/developer/news/680176">已支持一键部署 Pagic 应用</a>，还拥有免费的默认域名、CDN 加速等功能。</p>\n<p>你可以通过以下步骤来使用：</p>\n<ol>\n<li>在<a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a>免费开通 CloudBase</li>\n<li>在<a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a>新建一个环境</li>\n<li>运行 <code>npm i -g @cloudbase/cli</code> 安装 CloudBase CLI</li>\n<li>运行 <code>tcb login</code> 登录（会自动打开浏览器，在浏览器中授权）</li>\n<li>进入你的项目的根目录</li>\n<li>运行 <code>tcb init --without-template</code> 来初始化 CloudBase 的配置文件 <code>cloudbaserc.json</code></li>\n<li>运行 <code>tcb framework deploy</code> 来构建并部署 Pagic 应用（此过程会自动识别当前目录下的 <code>pagic.config.ts</code> 文件）</li>\n</ol>\n<p>构建完成后，就可以访问部署到免费域名的静态网站了（例子：<a href="https://pagic-6grnrtmbb2b18dee-1256604818.tcloudbaseapp.com/">使用 CloudBase 部署的 Pagic 官网</a>），接下来你可以在<a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a>中绑定自己的域名。</p>\n<p>参考：</p>\n<ul>\n<li><a href="https://cloud.tencent.com/developer/news/680176">CloudBase 更新日志 - 特性预览 3: 自动检测和部署 Pagic 应用</a></li>\n<li><a href="https://www.cloudbase.net/">CloudBase - 官网</a></li>\n<li><a href="https://cloud.tencent.com/document/product/876/41539">CloudBase - CLI 使用指南</a></li>\n<li><a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a></li>\n<li><a href="https://pagic-6grnrtmbb2b18dee-1256604818.tcloudbaseapp.com/">使用 CloudBase 部署的 Pagic 官网</a></li>\n</ul>'
        } }),
    'contentTitle': React.createElement("h1", { key: "0" }, "\u90E8\u7F72"),
    'contentBody': React.createElement("article", { dangerouslySetInnerHTML: {
            __html: '<p>构建完成后的 <code>dist</code> 目录可以作为一个网站部署到你的服务器上。我们强烈推荐通过持续集成让部署过程自动化，下面列出几种常见的部署方式：</p>\n<h2 id="github-pages">GitHub Pages<a class="anchor" href="#github-pages">§</a></h2>\n<p>GitHub Pages 是最常见的一种托管静态网站的服务，通过 GitHub 官方提供的 CI 工具 <a href="https://github.com/features/actions">GitHub Actions</a>，我们可以轻松的实现提交代码后自动构建并部署网站。</p>\n<p>实现自动部署网站到 GitHub Pages 非常简单，只需要在你的 GitHub 项目中创建一个 <code>.github/workflows/ci.yml</code> 文件，内容如下：</p>\n<pre class="language-yml"><code class="language-yml"><span class="token key atrule">name</span><span class="token punctuation">:</span> gh<span class="token punctuation">-</span>pages\n\n<span class="token key atrule">on</span><span class="token punctuation">:</span>\n  <span class="token key atrule">push</span><span class="token punctuation">:</span>\n    <span class="token key atrule">branches</span><span class="token punctuation">:</span>\n      <span class="token punctuation">-</span> master\n\n<span class="token key atrule">jobs</span><span class="token punctuation">:</span>\n  <span class="token key atrule">build-and-deploy</span><span class="token punctuation">:</span>\n    <span class="token key atrule">runs-on</span><span class="token punctuation">:</span> ubuntu<span class="token punctuation">-</span><span class="token number">18.04</span>\n    <span class="token key atrule">steps</span><span class="token punctuation">:</span>\n      <span class="token punctuation">-</span> <span class="token key atrule">uses</span><span class="token punctuation">:</span> actions/checkout@v2\n\n      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Setup deno\n        <span class="token key atrule">uses</span><span class="token punctuation">:</span> denolib/setup<span class="token punctuation">-</span>deno@v2\n        <span class="token key atrule">with</span><span class="token punctuation">:</span>\n          <span class="token key atrule">deno-version</span><span class="token punctuation">:</span> v1.2.3\n\n      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Build gh<span class="token punctuation">-</span>pages\n        <span class="token key atrule">run</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string"></span>\n          curl -fsSL https://deno.land/x/install/install.sh | sh\n          export DENO_INSTALL="/home/runner/.deno"\n          export PATH="$DENO_INSTALL/bin:$PATH"\n          deno --version\n          deno install --unstable --allow-read --allow-write --allow-net -n pagic https://deno.land/x/pagic@v0.9.8/mod.ts\n          <span>pagic build</span>\n\n      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Deploy gh<span class="token punctuation">-</span>pages\n        <span class="token key atrule">uses</span><span class="token punctuation">:</span> peaceiris/actions<span class="token punctuation">-</span>gh<span class="token punctuation">-</span>pages@v3\n        <span class="token key atrule">with</span><span class="token punctuation">:</span>\n          <span class="token key atrule">github_token</span><span class="token punctuation">:</span> $<span class="token punctuation">{</span><span class="token punctuation">{</span> secrets.GITHUB_TOKEN <span class="token punctuation">}</span><span class="token punctuation">}</span>\n          <span class="token key atrule">publish_dir</span><span class="token punctuation">:</span> ./dist\n<span class="highlighted-line">          <span class="token key atrule">cname</span><span class="token punctuation">:</span> ts.xcatliu.com</span></code></pre><p>注意替换掉最后一行的 <code>ts.xcatliu.com</code> 为你自己的域名。</p>\n<p>如果没有自己的域名的话，也可以使用 GitHub 提供的免费域名 <code>xxx.github.io</code>，此时只要将最后一行删除即可。注意此时可能需要修改 <code>pagic.config.ts</code> 中的 <code>root</code> 配置来支持子路径，详细可参考<a href="./config.html#root">配置文件</a>章节。</p>\n<h2 id="cloudbase">CloudBase<a class="anchor" href="#cloudbase">§</a></h2>\n<p><a href="https://www.cloudbase.net/">云开发 CloudBase</a> 是腾讯云提供的云原生一体化开发环境和工具平台，现<a href="https://cloud.tencent.com/developer/news/680176">已支持一键部署 Pagic 应用</a>，还拥有免费的默认域名、CDN 加速等功能。</p>\n<p>你可以通过以下步骤来使用：</p>\n<ol>\n<li>在<a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a>免费开通 CloudBase</li>\n<li>在<a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a>新建一个环境</li>\n<li>运行 <code>npm i -g @cloudbase/cli</code> 安装 CloudBase CLI</li>\n<li>运行 <code>tcb login</code> 登录（会自动打开浏览器，在浏览器中授权）</li>\n<li>进入你的项目的根目录</li>\n<li>运行 <code>tcb init --without-template</code> 来初始化 CloudBase 的配置文件 <code>cloudbaserc.json</code></li>\n<li>运行 <code>tcb framework deploy</code> 来构建并部署 Pagic 应用（此过程会自动识别当前目录下的 <code>pagic.config.ts</code> 文件）</li>\n</ol>\n<p>构建完成后，就可以访问部署到免费域名的静态网站了（例子：<a href="https://pagic-6grnrtmbb2b18dee-1256604818.tcloudbaseapp.com/">使用 CloudBase 部署的 Pagic 官网</a>），接下来你可以在<a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a>中绑定自己的域名。</p>\n<p>参考：</p>\n<ul>\n<li><a href="https://cloud.tencent.com/developer/news/680176">CloudBase 更新日志 - 特性预览 3: 自动检测和部署 Pagic 应用</a></li>\n<li><a href="https://www.cloudbase.net/">CloudBase - 官网</a></li>\n<li><a href="https://cloud.tencent.com/document/product/876/41539">CloudBase - CLI 使用指南</a></li>\n<li><a href="https://console.cloud.tencent.com/tcb">腾讯云 CloudBase 控制台</a></li>\n<li><a href="https://pagic-6grnrtmbb2b18dee-1256604818.tcloudbaseapp.com/">使用 CloudBase 部署的 Pagic 官网</a></li>\n</ul>'
        } }),
    'head': undefined,
    'script': React.createElement(React.Fragment, null,
        React.createElement("script", { src: "https://cdn.pagic.org/react@16.13.1/umd/react.production.min.js" }),
        React.createElement("script", { src: "https://cdn.pagic.org/react-dom@16.13.1/umd/react-dom.production.min.js" }),
        React.createElement("script", { src: "/index.js", type: "module" })),
    'toc': React.createElement("aside", { dangerouslySetInnerHTML: {
            __html: '<nav class="toc"><ol><li><a href="#github-pages">GitHub Pages</a></li><li><a href="#cloudbase">CloudBase</a></li></ol></nav>'
        } }),
    'date': "2020-10-13T03:55:11.929Z",
    'updated': null,
    'author': undefined,
    'contributors': [],
    'blog': {
        "isPost": false,
        "isPosts": false,
        "posts": [
            {
                "pagePath": "blog/design_pagic_config_ts.md",
                "title": "设计 pagic.config.ts",
                "link": "blog/design_pagic_config_ts.html",
                "date": "2020-07-12T00:00:00.000Z",
                "updated": null
            }
        ]
    }
};
