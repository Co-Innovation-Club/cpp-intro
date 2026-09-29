import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

// JetBrains Mono：只打包 latin 子集的常规体与粗体，用于代码块。
//
// 为什么不全平台依赖系统字体：macOS 的 SF Mono 确实好，但 Windows 只有 Consolas
// （字形偏旧，0 与 O 的区分不如 JetBrains Mono 明显），Linux 常见的是 DejaVu Sans Mono。
// 同一个代码块在三个平台会长得不一样。自托管一个字体，各处看到的是同一份。
//
// 为什么只打 latin：中文字库动辄数 MB，且 PingFang / 微软雅黑有版权不能随站点分发，
// 中文注释只能交给系统字体（见 custom.css 里 --vp-font-family-mono 的兜底说明）。
// latin 子集覆盖 ASCII，代码里的符号、数字、标识符都在这一档里，约 21KB。
//
// 700 也要是因为 shiki 的语法高亮会给部分 token 加粗；浏览器按需下载，没用到就不下。
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-700.css'

// 只有需要在 Markdown 里直接写的组件才全局注册。
// FloatNav 由 Layout.vue 直接引入，IdeWindow 由 CoverHero.vue 直接引入。
import CoverHero from './components/CoverHero.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import Layout from './Layout.vue'
import { setupReveal } from './reveal'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    app.component('CoverHero', CoverHero)
    app.component('FeatureGrid', FeatureGrid)

    if (!import.meta.env.SSR) setupReveal(router)
  }
} satisfies Theme
