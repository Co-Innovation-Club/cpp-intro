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

## 许可

Copyright (c) 2026 Co-Innovation-Club

本站内容与代码以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh)（知识共享署名 4.0 国际）许可发布，转载或修改需署名并标注许可，详见 [LICENSE](LICENSE)。
