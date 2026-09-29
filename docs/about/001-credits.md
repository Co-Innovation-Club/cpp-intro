---
title: "来源与致谢"
description: "本站内容来源、署名信息与许可说明"
---

# 来源与致谢

本站是面向初学者的 C++ 入门文档，由 Co-Innovation-Club 维护。

## C++ 基础

「C++ 基础」栏目（[`docs/cpp/`](https://github.com/co-innovation-club/cpp-intro/tree/main/docs/cpp)，
即站点上的 `/cpp/` 路径）改编自以下作品：

| 项目 | 说明 |
| --- | --- |
| 作品名称 | 《C 语言入门教程》 |
| 作者 | 阮一峰（wangdoc） |
| 来源 | <https://github.com/wangdoc/clang-tutorial> |
| 原许可 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh) |

### 本站所做的修改

依据 CC BY-SA 4.0 第 3(a)(1)(B) 条，此处说明本站对该作品所做的改动：

- 将原本基于 loppo 的 Markdown 文档转换为 VitePress 站点格式，补充页面元信息（`title`、`description`）；
- 调整文件命名与目录结构，接入本站侧边栏导航；
- **将原稿的 C 语言内容改写为 C++**（面向算法竞赛）：代码示例改用 `#include <bits/stdc++.h>`
  与 `using namespace std;`，输入输出以 `cin`/`cout` 为主，并引入 `string`、`vector` 等
  标准库用法；术语、章节标题与叙述语气随之调整，但保留原有章节划分与知识点覆盖范围。

上述内容属于改写稿，与原稿存在差异；需要引用原文时请以[原仓库](https://github.com/wangdoc/clang-tutorial)内容为准。

### 许可

本栏目及据其产生的改编内容，均以
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh) 许可发布。
使用时须注明上表中的作者与来源，并以相同许可发布衍生作品。

## 本站其它内容

除上述改编栏目外，本站其余内容（含《搭建开发环境》《跑通「Hello World」》及首页、主题样式等）由 Co-Innovation-Club 编写。

## 许可总览

本站全部内容以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh)
（署名—相同方式共享 4.0 国际）许可发布，详见仓库根目录的 [LICENSE](https://github.com/co-innovation-club/cpp-intro/blob/main/LICENSE)。
