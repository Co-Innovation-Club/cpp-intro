<script setup lang="ts">
import { withBase } from 'vitepress'
import IdeWindow from './IdeWindow.vue'
</script>

<template>
  <section class="cover">
    <div class="cover__aura" aria-hidden="true" />

    <div class="cover__inner">
      <div class="cover__text">
        <div class="cover__badge">
          <span class="cover__pulse" />
          A CIC Project
        </div>

        <h1 class="cover__title">
          <span class="cover__title-line">C++入门指南</span>
          <span class="cover__title-line cover__title-line--alt">协同创新三号实验室</span>
        </h1>

        <p class="cover__desc">
          所有宏大的数字世界，都始于终端里的一句回应
        </p>

        <div class="cover__actions">
          <a class="cover__btn cover__btn--primary" :href="withBase('/guide/install')">
            从安装开始
            <span class="cover__arrow">→</span>
          </a>
          <a class="cover__btn" href="#about">本文档说明</a>
        </div>

        <p class="cover__note">
          内容持续更新中。
        </p>
      </div>

      <div class="cover__visual">
        <IdeWindow />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cover {
  position: relative;
  min-height: calc(100vh - var(--vp-nav-height) - 32px);
  display: flex;
  align-items: center;
  padding: 40px 0 32px;
  overflow: hidden;
}

.cover__aura {
  position: absolute;
  inset: -30% -10% auto -20%;
  height: 720px;
  pointer-events: none;
  background:
    radial-gradient(38% 42% at 22% 32%, rgba(217, 96, 63, 0.2), transparent 68%),
    radial-gradient(30% 34% at 82% 18%, rgba(86, 182, 194, 0.12), transparent 70%);
  filter: blur(6px);
}

.cover__inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
  gap: 60px;
  align-items: center;
  width: 100%;
}

.cover__badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12.5px;
  letter-spacing: 0.02em;
}

.cover__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-brand-2);
  box-shadow: 0 0 0 4px rgba(217, 96, 63, 0.18);
}

.cover__title {
  margin: 26px 0 0;
  font-size: clamp(38px, 5.2vw, 60px);
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -0.01em;
}

.cover__title-line {
  display: block;
}

.cover__title-line--alt {
  /* 副行比主行小一号，「主大·副小」的层级。
   * 主标题用 clamp(38px, 5.2vw, 60px)；
   * 副标题 9 个字 (协同创新三号实验室) 在窄屏也不能折行，
   * 上限 42px、下限 28px，留得足够。 */
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 700;
  background: linear-gradient(96deg, var(--vp-c-brand-1), var(--vp-c-brand-3) 58%, #e8a06a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.cover__desc {
  margin: 22px 0 0;
  max-width: 30em;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.9;
}

.cover__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.cover__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 24px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.cover__btn:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-2);
}

.cover__btn--primary {
  border-color: transparent;
  background: linear-gradient(180deg, #e0704c, #c05036);
  color: #fff;
  box-shadow: 0 12px 26px -14px rgba(217, 96, 63, 0.85);
}

.cover__btn--primary:hover {
  background: linear-gradient(180deg, #ea7a55, #c8543a);
}

.cover__arrow {
  transition: transform 0.18s ease;
}

.cover__btn--primary:hover .cover__arrow {
  transform: translateX(3px);
}

.cover__note {
  margin: 26px 0 0;
  color: var(--vp-c-text-3);
  font-size: 12.5px;
  line-height: 1.7;
}

.cover__visual {
  min-width: 0;
}

@media (max-width: 960px) {
  .cover__inner {
    grid-template-columns: 1fr;
    gap: 44px;
  }

  .cover {
    min-height: 0;
    padding-top: 24px;
  }

  .cover__visual {
    max-width: 560px;
  }
}
</style>
