import type { Router } from 'vitepress'

/**
 * 进场动效：只在「进入这个页面」时播一次，向下滚动的内容一律不做动效。
 *
 * 设计约束（来自需求）：
 * - 动效不是一直有的。进入页面时首屏附近的内容轻轻浮入一次，
 *   往下滑时看到的内容直接就是加载好的状态，不再触发任何动画。
 * - 首页：英雄区（首屏那一屏）本身不动，其下的首组区块错开浮入。
 * - 内页：整页自然淡入，程度比首页更弱，优先保证可读性。
 * - 只做加法：没有 JS、或用户要求减少动效时，内容照常完整显示。
 */

/** 首页参与错开浮入的区块：英雄区以下的第一组内容 */
const HOME_SELECTOR = ['.cover-section-title', '.cover-section-desc', '.fgrid', '.cover-nav'].join(',')

/** 首页最多处理这么多元素，保证「首组」的界限稳定，不会一路滚到底 */
const HOME_LIMIT = 7

/** 同组内错开的步长与上限 */
const HOME_STEP = 90
const HOME_MAX_STEP_INDEX = 4

function run() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const isCover = !!document.querySelector('.Layout.cover-page')

  if (!isCover) {
    // 内页：整页淡入一次，不逐元素位移，尽量减少对阅读的干扰。
    // 先把 0 态写上并强制一次样式计算（读 offsetHeight），确认浏览器已经认下这个起点，
    // 再进入下一帧切到 1 态——否则两个类同帧生效，同特异度下后来的直接覆盖，过渡不会播。
    root.classList.add('page-fade')
    void document.body.offsetHeight
    window.requestAnimationFrame(() => {
      root.classList.add('page-fade-in')
    })
    return
  }

  // 首页：取英雄区以下的首组区块，错开浮入
  const pending = [...document.querySelectorAll<HTMLElement>(HOME_SELECTOR)]
    .filter(el => !el.closest('.cover__inner'))
    .slice(0, HOME_LIMIT)

  if (pending.length === 0) return

  root.classList.add('has-reveal')
  pending.forEach((el, i) => {
    el.classList.add('reveal')
    el.style.setProperty('--reveal-delay', `${Math.min(i, HOME_MAX_STEP_INDEX) * HOME_STEP}ms`)
  })

  // 下一帧统一放行，让过渡真正播出来
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    pending.forEach(el => el.classList.add('is-visible'))
  }))

  // 兜底：即使过渡没跑起来，元素也不能一直藏着
  window.setTimeout(() => {
    pending.forEach(el => el.classList.add('is-visible'))
  }, 600)
}

export function setupReveal(router: Router) {
  if (typeof window === 'undefined') return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  const reset = () => {
    const root = document.documentElement
    root.classList.remove('has-reveal', 'page-fade', 'page-fade-in')
    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
      el.classList.remove('reveal', 'is-visible')
      el.style.removeProperty('--reveal-delay')
    })
  }

  const go = () => {
    reset()
    // 等两帧，确保新页面的布局已就位再取位置
    window.requestAnimationFrame(() => window.requestAnimationFrame(run))
  }

  go()
  router.onAfterRouteChange = go
}
