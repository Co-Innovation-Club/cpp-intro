# C++入门

面向 C++ 初学者的入门文档，基于 VitePress 构建，部署在 GitHub Pages。

在线地址：<https://co-innovation-club.github.io/cpp-intro/>

## 内容

从安装环境、跑通第一个程序开始，写给第一次接触 C++ 的人。内容持续更新中，以在线站点为准。

文档按小熊猫C++ 3.4.3279 撰写，软件仍在更新，菜单与快捷键以实际版本为准。

## 本地开发

本项目用 pnpm 管理依赖，版本由 `package.json` 的 `packageManager` 字段锁定。

```bash
pnpm install       # 安装依赖
pnpm dev           # 本地预览
pnpm build         # 构建静态站点
pnpm preview       # 预览构建产物
```

仓库里只有 `pnpm-lock.yaml`，另跑 `npm install` 会多出一份 `package-lock.json`，
两套锁文件并存会让本地与 CI 装出不同的依赖树。

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

该许可仅覆盖本仓库中的文档与站点代码，不覆盖小熊猫C++ 软件本身——后者是独立的开源项目，权利归其作者所有。本站为非官方内容。
