# C++入门

面向 C++ 初学者的入门文档，基于 VitePress 构建，部署在 GitHub Pages。

在线地址：<https://co-innovation-club.github.io/cpp-intro/>


## 本地开发

本项目用 pnpm 管理依赖，版本由 `package.json` 的 `packageManager` 字段锁定。

```bash
pnpm install       # 安装依赖
pnpm dev           # 本地预览
pnpm build         # 构建静态站点
pnpm preview       # 预览构建产物
```

## 目录结构

```
docs/
├── .vitepress/
│   ├── config.mts        # 站点配置（含 sitemap、robots.txt、RSS 构建钩子）
│   └── theme/            # 自定义主题：首页组件与样式
├── guide/                # 文档正文
└── index.md              # 首页
```

## 内容来源与致谢

本站「C 语言基础」栏目（`docs/c/`）的正文，改编自阮一峰（wangdoc）的
[C 语言入门教程](https://github.com/wangdoc/clang-tutorial)，原作者保留署名权。
该教程以 CC BY-SA 4.0 发布，本站在其基础上进行了格式转换与站点适配，改编部分
同样以 CC BY-SA 4.0 发布。详细署名见 [来源与致谢](docs/about/credits.md)。

## 许可

Copyright (c) 2026 Co-Innovation-Club

本站内容与代码以
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh)
（知识共享 署名—相同方式共享 4.0 国际）许可发布。

你可以自由复制、传播、改编本站内容，但须遵守两项条件：

- **署名（BY）**：注明原作者与来源，并标明是否作了修改；
- **相同方式共享（SA）**：若基于本站内容创作衍生作品，须以相同许可发布。

详见 [LICENSE](LICENSE)。
