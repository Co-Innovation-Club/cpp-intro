import { defineConfig } from 'vitepress'
import type { SiteConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'
import { promises as fs, readdirSync } from 'node:fs'
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
const SITE_DESCRIPTION = 'C++ 入门文档，包含开发环境搭建、首个程序运行与 C++ 基础语法'

/**
 * 部署在 GitHub Pages 项目页的子路径下，必须设 base，
 * 否则产物里所有 /assets/... 绝对路径都会 404。
 */
const BASE = '/cpp-intro/'

/**
 * 正文所在目录，相对运行 vitepress 时的工作目录（仓库根目录）。
 * vitepress-sidebar 的 documentRootPath 内部是 path.join(cwd, 这个值)，
 * 只能写相对路径，所以这里也保持相对，两处共用同一个常量。
 */
const DOC_ROOT = 'docs'

/**
 * 正文文件名带三位编号（`020-multibyte.md`），编号就是目录顺序，
 * 在文件系统里按名字排序即可定位。全部正文统一用这个格式。
 */
const ORDER_PREFIX = /(^|\/)\d{3}-/

/**
 * 把带编号的路径还原成线上地址用的路径：`cpp/020-multibyte.md` → `cpp/multibyte.md`。
 */
function stripOrderPrefix(p: string): string {
  return p.replace(ORDER_PREFIX, '$1')
}

/**
 * 扫描出所有带编号的正文文件，返回相对 DOC_ROOT 的路径。
 *
 * 这里用同步读目录，因为 rewrites 必须在 defineConfig 时就给出来，
 * 不能等异步完成。
 */
function collectNumberedFiles(dir: string, base: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.vitepress' || entry.name === 'public') continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectNumberedFiles(abs, base, out)
    } else if (/^\d{3}-.+\.md$/.test(entry.name)) {
      out.push(path.relative(base, abs).replace(/\\/g, '/'))
    }
  }
  return out
}

const REWRITES = Object.fromEntries(
  collectNumberedFiles(DOC_ROOT, DOC_ROOT).map(f => [f, stripOrderPrefix(f)])
)

const vpConfig = defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,

  base: BASE,

  // 文件名带编号只为在文件系统里好找，线上地址不带编号：
  // cpp/020-multibyte.md 仍然发布在 /cpp/multibyte。
  // 映射由扫描目录得出，新增文件不用改配置。
  rewrites: REWRITES,

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

/**
 * 侧边栏由 vitepress-sidebar 扫描 docs/ 生成，不在这里逐个列页面：
 *   目录 → 分组，分组名与分组顺序取自该目录下的 sidebar.config.json
 *   文件 → 条目，标题取自 frontmatter 的 title，顺序由文件名编号决定
 * 新增、删除、重命名一篇文档都不用再动这个文件。
 *
 * 用 withSidebar 而不是直接把 generateSidebar() 塞进 themeConfig.sidebar，
 * 是因为前者额外挂了一个 Vite 插件：dev 下增删 md 会重建侧边栏，
 * 否则不重启 dev server 就看不到新章节，容易让人以为生成没生效又去手写。
 * 该插件的做法是 touch 配置文件触发整体重载，所以下面对 sidebar 的改写也会一并重跑。
 */
const siteConfig = withSidebar(vpConfig, {
  documentRootPath: DOC_ROOT,
  // 标题优先取 frontmatter 的 title，没有 title 的（guide 两篇）退回正文首个 H1
  useTitleFromFrontmatter: true,
  useTitleFromFileHeading: true,
  // 页面不再逐篇写 order：文件名编号已经表达了顺序，默认扫描顺序即文件名顺序。
  // 这里仍要开这个选项，是因为分组顺序（sidebar.config.json 的 $folder.order）靠它生效。
  sortMenusByFrontmatterOrder: true,
  frontmatterOrderDefaultValue: 999,
  includeEmptyFolder: false
})

/**
 * 插件按真实文件名生成链接，带编号（/cpp/020-multibyte），
 * 而 rewrites 已经把线上地址还原成 /cpp/multibyte。
 * 不改这里的话侧边栏每一条都是死链。
 */
siteConfig.themeConfig!.sidebar = stripOrderPrefixFromSidebar(
  siteConfig.themeConfig!.sidebar as unknown as SidebarEntry[]
) as never

export default siteConfig

/* ---------- 构建钩子：robots.txt 与 feed.xml ---------- */

interface MarkdownPage {
  /** 输出站点上的路径，以 / 开头，不带 .html */
  url: string
  title: string
  description: string
  date: Date
}

/** 侧边栏条目。只关心 link 与子条目，其余字段原样透传。 */
interface SidebarEntry {
  link?: string
  items?: SidebarEntry[]
  [key: string]: unknown
}

function stripOrderPrefixFromSidebar(entries: SidebarEntry[]): SidebarEntry[] {
  return entries.map(entry => ({
    ...entry,
    ...(entry.link ? { link: stripOrderPrefix(entry.link) } : {}),
    ...(entry.items ? { items: stripOrderPrefixFromSidebar(entry.items) } : {})
  }))
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
    // 与 rewrites 对齐：文件名带编号，地址不带
    const clean = stripOrderPrefix(rel)
    // 根目录的 index.md 就是首页本身，不能变成 /index
    let url = clean === 'index.md' ? '/' : '/' + clean.replace(/\.md$/, '')
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
    // --follow 是为了跨过重命名：正文文件名带编号后，不带 --follow 的 git log
    // 只认改名后的新路径，查到的是改名那次提交。
    const { stdout } = await execFileAsync(
      'git',
      ['log', '--follow', '--format=%x00%cI', '--name-status', '--', path.basename(file)],
      { cwd: path.dirname(file) }
    )
    // 标记放在日期之前，按 \0 切开后每段是「日期\n 状态\t路径 …」
    for (const block of stdout.split('\0').slice(1)) {
      const [iso, ...statusLines] = block.split('\n').map(l => l.trim()).filter(Boolean)
      // 相似度 100% 的改名没有改动内容，不算「更新」，跳过继续往前找；
      // 否则一次批量改名会把 feed 里所有条目的日期刷成同一天。
      const isPureRename =
        statusLines.length > 0 && statusLines.every(l => l.startsWith('R100\t'))
      if (isPureRename) continue
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