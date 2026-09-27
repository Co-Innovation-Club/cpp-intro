import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

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
