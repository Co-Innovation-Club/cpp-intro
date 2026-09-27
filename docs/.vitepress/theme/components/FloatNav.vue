<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { theme, frontmatter, page } = useData()

/**
 * 只在正文页出现。首页是 cover-page 布局，自有导航卡片，再挂一个侧栏是多余的；
 * 404 页同理。
 */
const visible = computed(() => {
  const fm = frontmatter.value || {}
  return fm.pageClass !== 'cover-page' && !page.value?.isNotFound
})

/**
 * 条目直接取自 themeConfig.sidebar，不另写一份清单。
 * 以后在 config.mts 里增删页面，这里自动跟着变，不会两处不同步。
 * sidebar 既可能是数组（本站），也可能是按路径分组的对象，故先归一化。
 */
const items = computed(() => {
  const sb = theme.value?.sidebar
  if (!sb) return []
  const groups = Array.isArray(sb) ? sb : Object.values(sb)
  const out: { text: string; link: string }[] = []
  for (const g of groups) {
    if (Array.isArray(g)) out.push(...g)
    else if (g && Array.isArray(g.items)) out.push(...g.items)
  }
  return out.filter(i => i && i.text && i.link)
})

/** 当前页在 sidebar 里的相对路径，用于高亮 */
const currentPath = computed(() =>
  (page.value?.relativePath || '').replace(/\.md$/, '').replace(/\/index$/, '')
)

function isActive(link: string): boolean {
  return currentPath.value === String(link).replace(/^\//, '').replace(/\.html$/, '')
}

/* 图标按链接关键字取，取不到用通用文档图标。
 * 用 currentColor 描边，颜色随文字状态走（常态次要色、当前页品牌色），
 * 不必为图标单独配色。 */
const ICON = {
  install: 'M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5M5 19h14',
  program: 'M9 7l-5 5 5 5M15 7l5 5-5 5',
  doc: 'M7 4h7l4 4v12H7z'
}

function iconFor(link: string): string {
  const l = String(link).toLowerCase()
  if (l.includes('install')) return ICON.install
  if (l.includes('program')) return ICON.program
  return ICON.doc
}
</script>

<template>
  <nav v-if="visible && items.length" class="floatnav" aria-label="本文档目录">
    <!-- 收起时只露出这一列竖排文字，展开后让位给条目列表 -->
    <span class="floatnav__rail" aria-hidden="true">目录</span>
    <ul class="floatnav__list">
      <li v-for="item in items" :key="item.link">
        <a
          class="floatnav__item"
          :class="{ 'is-active': isActive(item.link) }"
          :href="withBase(item.link)"
          :aria-current="isActive(item.link) ? 'page' : undefined"
        >
          <svg class="floatnav__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconFor(item.link)" />
          </svg>
          <span class="floatnav__text">{{ item.text }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* 悬浮侧栏：贴在屏幕左缘、垂直居中，平时收起成一条竖排「目录」，
 * 悬停或键盘聚焦时向右展开列出各篇标题。
 *
 * 做成悬浮而非固定分栏，是因为正文是整页居中的（见 custom.css 里
 * 「内页：与首页同一套版式」）。固定分栏会随视口变宽而远离正文，
 * 且要占掉正文两侧的留白；悬浮则只占自己那一小块，展开时浮在
 * 正文之上，不改变任何既有排版。
 *
 * 底色与导航栏同一套（半透明 + 背景模糊），使两者观感一致。
 */
.floatnav {
  position: fixed;
  left: 0;
  top: 50%;
  z-index: 28;
  display: flex;
  align-items: stretch;
  width: 46px;
  transform: translateY(-50%);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-left: 0;
  border-radius: 0 12px 12px 0;
  background-color: var(--glass-bg);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  backdrop-filter: saturate(180%) blur(14px);
  transition: width 420ms var(--ease-out-expo);
}

/* 收起态的竖排标签 */
.floatnav__rail {
  flex: 0 0 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  overflow: hidden;
  writing-mode: vertical-rl;
  letter-spacing: 0.32em;
  font-size: 12px;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition:
    flex-basis 420ms var(--ease-out-expo),
    opacity 160ms ease;
}

/* 展开态的条目列表。收起时宽度已占好，仅以透明度隐藏，
 * 这样展开动画只需动容器宽度，文字不会跟着抖动。 */
.floatnav__list {
  flex: 0 0 200px;
  max-height: calc(100vh - 160px);
  margin: 0;
  padding: 10px 14px;
  overflow-y: auto;
  list-style: none;
  opacity: 0;
  transition: opacity 240ms ease 80ms;
}

.floatnav:hover,
.floatnav:focus-within {
  width: 200px;
}

/* 展开时竖排标签让出位置，否则它会白占 45px */
.floatnav:hover .floatnav__rail,
.floatnav:focus-within .floatnav__rail {
  flex-basis: 0;
  opacity: 0;
}

.floatnav:hover .floatnav__list,
.floatnav:focus-within .floatnav__list {
  opacity: 1;
}

.floatnav__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  /* 8px 与站内小控件（搜索框、代码块）同值，不再用一个孤立的 7px */
  border-radius: 8px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 200ms ease,
    background-color 200ms ease;
}

.floatnav__item:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
}

.floatnav__item.is-active {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.floatnav__icon {
  flex: 0 0 auto;
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.7;
}

.floatnav__item.is-active .floatnav__icon {
  opacity: 1;
}

/* 视口够宽时直接常驻展开，条目文字一眼可见，不必先悬停。
 *
 * 阈值取 1680px：正文最大宽 1240px 居中，此时左侧留白
 * (1680 - 1240) / 2 = 220px，正好容得下 200px 的面板而不压住正文。
 * 低于此宽度留白不够，就只能收起、悬停时再浮到正文之上。 */
@media (min-width: 1680px) {
  .floatnav {
    width: 200px;
  }

  .floatnav__rail {
    display: none;
  }

  .floatnav__list {
    opacity: 1;
    transition: none;
  }
}

/* 视口窄时正文两侧留白不足，展开会压住正文，直接不出现。
 * 960px 以下 VitePress 本来就有抽屉式侧栏可用。 */
@media (max-width: 1279px) {
  .floatnav {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .floatnav,
  .floatnav__rail,
  .floatnav__list {
    transition: none;
  }
}
</style>
