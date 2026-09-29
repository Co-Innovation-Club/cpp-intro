import { defineConfig } from 'vitepress'
import type { SiteConfig } from 'vitepress'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/**
 * 部署域名。VitePress 内置 sitemap、生成的 robots.txt 与 feed.xml 都用这里。
 * GitHub Pages 项目页的地址形如 https://<组织名>.github.io/<仓库名>/，末尾不带斜杠。
 * 组织名一律小写：GitHub 的命名空间不区分大小写，但 Pages 域名习惯用小写，
 * 且这里的值会原样写进 sitemap.xml 与 feed.xml，大小写混写不方便核对。
 */
const SITE_URL = 'https://co-innovation-club.github.io/cpp-intro'

/**
 * 站点源码仓库地址。
 */
const REPO_URL = 'https://github.com/co-innovation-club/cpp-intro'

const SITE_TITLE = 'C++入门指南'
const SITE_DESCRIPTION = 'C++入门文档，所有宏大的数字世界，都始于终端里的一句回应'

/**
 * 部署在 GitHub Pages 项目页的子路径下，必须设 base，
 * 否则产物里所有 /assets/... 绝对路径都会 404。
 */
const BASE = '/cpp-intro/'

export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,

  base: BASE,

  sitemap: {
    // VitePress 把页面 URL（不含 base）直接交给 sitemap 库，且该库会用 hostname 的
    // origin 重新解析相对路径、吃掉子路径。所以这里传完整绝对 URL 绕开解析。
    hostname: SITE_URL,
    transformItems: items =>
      items.map(item => ({
        ...item,
        url: item.url.startsWith('http') ? item.url : `${SITE_URL}/${item.url.replace(/^\//, '')}`
      }))
  },

  head: [
    ['link', { rel: 'icon', href: `${BASE}favicon.ico`, sizes: 'any' }],
    ['link', { rel: 'icon', href: `${BASE}favicon.svg`, type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#12141a' }],
    ['meta', { property: 'og:title', content: SITE_TITLE }],
    ['meta', { property: 'og:description', content: SITE_DESCRIPTION }]
  ],

  themeConfig: {
    outline: [2, 3],
    lastUpdatedText: '最后更新',

    // 导航栏只放两栏：首页与文档。
    // 栏目多了反而要读者先做一次「去哪一栏」的选择。
    // 首页的称呼固定为「首页」，不用「封面」。
    nav: [
      { text: '首页', link: '/' },
      { text: '文档', link: '/guide/install' }
    ],

    // 侧边栏按学习顺序排成一条线：先跑通环境，再学 C 语言基础，
    // 标准库参考放最后并默认折叠，避免一屏塞满。
    sidebar: [
      {
        text: '入门',
        items: [
          { text: '搭建开发环境', link: '/guide/install' },
          { text: '跑通「Hello World」', link: '/guide/first-program' }
        ]
      },
      {
        text: 'C++ 基础',
        items: [
          { text: 'C++ 简介', link: '/cpp/intro' },
          { text: '基本语法', link: '/cpp/syntax' },
          { text: '变量', link: '/cpp/variable' },
          { text: '运算符', link: '/cpp/operator' },
          { text: '流程控制', link: '/cpp/flow-control' },
          { text: '数据类型', link: '/cpp/types' },
          { text: '指针', link: '/cpp/pointer' },
          { text: '函数', link: '/cpp/function' },
          { text: '数组', link: '/cpp/array' },
          { text: '字符串', link: '/cpp/string' },
          { text: '内存管理', link: '/cpp/memory' },
          { text: '结构体', link: '/cpp/struct' },
          { text: 'typedef 与 using', link: '/cpp/typedef' },
          { text: '联合体', link: '/cpp/union' },
          { text: '枚举', link: '/cpp/enum' },
          { text: '预处理器', link: '/cpp/preprocessor' },
          { text: '输入输出', link: '/cpp/io' },
          { text: '文件操作', link: '/cpp/file' },
          { text: '变量说明符', link: '/cpp/specifier' },
          { text: '多文件项目', link: '/cpp/multifile' },
          { text: '命令行环境', link: '/cpp/cli' },
          { text: '字符编码', link: '/cpp/multibyte' }
        ]
      },
      {
        text: '标准库参考',
        collapsed: true,
        items: [
          { text: 'assert.h', link: '/c/lib/assert-h' },
          { text: 'ctype.h', link: '/c/lib/ctype-h' },
          { text: 'errno.h', link: '/c/lib/errno-h' },
          { text: 'float.h', link: '/c/lib/float-h' },
          { text: 'inttypes.h', link: '/c/lib/inttypes-h' },
          { text: 'iso646.h', link: '/c/lib/iso646-h' },
          { text: 'limits.h', link: '/c/lib/limits-h' },
          { text: 'locale.h', link: '/c/lib/locale-h' },
          { text: 'math.h', link: '/c/lib/math-h' },
          { text: 'signal.h', link: '/c/lib/signal-h' },
          { text: 'stdarg.h', link: '/c/lib/stdarg-h' },
          { text: 'stdbool.h', link: '/c/lib/stdbool-h' },
          { text: 'stddef.h', link: '/c/lib/stddef-h' },
          { text: 'stdint.h', link: '/c/lib/stdint-h' },
          { text: 'stdio.h', link: '/c/lib/stdio-h' },
          { text: 'stdlib.h', link: '/c/lib/stdlib-h' },
          { text: 'string.h', link: '/c/lib/string-h' },
          { text: 'time.h', link: '/c/lib/time-h' },
          { text: 'wchar.h', link: '/c/lib/wchar-h' },
          { text: 'wctype.h', link: '/c/lib/wctype-h' }
        ]
      },
      {
        text: '关于本站',
        items: [{ text: '来源与致谢', link: '/about/credits' }]
      }
    ],

    socialLinks: [
      { icon: 'github', link: REPO_URL }
    ],

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除查询',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    footer: {
      message: '立象尽意',
      // 「C++ 基础」栏目改编自 wangdoc 的 C 语言教程，署名落在这里：CC BY-SA 4.0 要求
      // 署名须为读者在正常浏览时可见，页脚每页都在，同时不打断正文阅读。
      copyright:
        '© 2026 Co-Innovation-Club · 部分内容改编自 <a href="https://github.com/wangdoc/clang-tutorial" target="_blank" rel="noopener">wangdoc/clang-tutorial</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh" target="_blank" rel="noopener">CC BY-SA 4.0</a>'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark-dimmed'
    },
    lineNumbers: false
  },

  async buildEnd(siteConfig) {
    const outDir = siteConfig.outDir
    await Promise.all([
      writeRobots(outDir),
      writeFeed(siteConfig)
    ])
  }
})

/* ---------- 构建钩子：robots.txt 与 feed.xml ---------- */

interface MarkdownPage {
  /** 输出站点上的路径，以 / 开头，不带 .html */
  url: string
  title: string
  description: string
  date: Date
}

async function walkMarkdown(dir: string, base: string, out: MarkdownPage[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkMarkdown(abs, base, out)
      continue
    }
    if (!entry.name.endsWith('.md')) continue
    const raw = await fs.readFile(abs, 'utf8')
    const { title, description } = parseFrontmatter(raw, abs)
    const rel = path.relative(base, abs).replace(/\\/g, '/')
    // 根目录的 index.md 就是首页本身，不能变成 /index
    let url = rel === 'index.md' ? '/' : '/' + rel.replace(/\.md$/, '')
    if (url !== '/' && url.endsWith('/')) url = url.slice(0, -1)
    const stat = await fs.stat(abs)
    out.push({
      url,
      // 首页的 frontmatter 故意不写 title（写了会与站名拼成「C++入门 | C++入门指南」），
      // parseFrontmatter 只能退回文件名，RSS 里就成了裸的「index」。这里补回站名。
      title: url === '/' ? SITE_TITLE : title,
      description: url === '/' && !description ? SITE_DESCRIPTION : description,
      date: await lastCommitDate(abs, stat.mtime)
    })
  }
}

/**
 * 取文件的最后一次提交时间，用于 feed.xml 的 pubDate。
 *
 * 不能用文件 mtime：GitHub Actions 里 actions/checkout 拉下来的文件，
 * mtime 全是检出那一刻，于是每次构建 feed 里所有条目的日期都被刷新成构建时间，
 * 订阅端会反复把旧文章标成未读。真正的「最后更新」只有 git 里才有。
 *
 * 查不到（本地还没 git init、文件尚未提交、git 不可用）时退回 mtime，
 * 这样本地预览时 feed 依然有合理日期，不会构建失败。
 */
async function lastCommitDate(file: string, fallback: Date): Promise<Date> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', '-1', '--format=%cI', '--', path.basename(file)],
      { cwd: path.dirname(file) }
    )
    const iso = stdout.trim()
    if (iso) {
      const d = new Date(iso)
      if (!Number.isNaN(d.getTime())) return d
    }
  } catch {
    /* 非 git 仓库或 git 不可用，走 fallback */
  }
  return fallback
}

function parseFrontmatter(raw: string, file: string): { title: string; description: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  let title = ''
  let description = ''
  if (m) {
    const block = m[1]
    const titleM = block.match(/^\s*title:\s*(.+?)\s*$/m)
    const descM = block.match(/^\s*description:\s*(.+?)\s*$/m)
    if (titleM) title = stripQuotes(titleM[1])
    if (descM) description = stripQuotes(descM[1])
  }
  if (!title) {
    const h = raw.match(/^#\s+(.+?)\s*$/m)
    if (h) title = h[1].trim()
  }
  if (!title) title = path.basename(file, '.md')
  return { title, description }
}

function stripQuotes(v: string): string {
  const s = v.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function escapeXml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function writeRobots(outDir: string): Promise<void> {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ''
  ].join('\n')
  await fs.writeFile(path.join(outDir, 'robots.txt'), body, 'utf8')
}

async function writeFeed(siteConfig: SiteConfig): Promise<void> {
  const pages: MarkdownPage[] = []
  await walkMarkdown(siteConfig.srcDir, siteConfig.srcDir, pages)
  pages.sort((a, b) => b.date.getTime() - a.date.getTime())

  const now = new Date().toUTCString()
  const items = pages
    .map(p => {
      const link = `${SITE_URL}${p.url}`
      return [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${p.date.toUTCString()}</pubDate>`,
        p.description ? `      <description>${escapeXml(p.description)}</description>` : '',
        '    </item>'
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(SITE_TITLE)}</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>\n` +
    `    <language>zh-CN</language>\n` +
    `    <lastBuildDate>${now}</lastBuildDate>\n` +
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n` +
    items +
    `\n  </channel>\n` +
    `</rss>\n`

  await fs.writeFile(path.join(siteConfig.outDir, 'feed.xml'), xml, 'utf8')
}