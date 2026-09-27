<script setup lang="ts">
import AppIcon from './AppIcon.vue'

interface Feature {
  title: string
  desc: string
  icon: string
}

const features: Feature[] = [
  {
    title: '开箱即用',
    desc: '安装包自带MinGW-w64 GCC11.5.0，装完即可编译运行。',
    icon: 'box'
  },
  {
    title: '全中文界面',
    desc: '安装向导、菜单、面板都是中文，界面术语一目了然。',
    icon: 'spark'
  },
  {
    title: '编译运行一步到位',
    desc: 'F9编译、F11编译并运行、F12全部重新编译，三个键覆盖日常操作。',
    icon: 'play'
  },
  {
    title: '运行结果看得明',
    desc: '程序结束后控制台显示返回值、总耗时、CPU时间与内存占用。',
    icon: 'terminal'
  }
]
</script>

<template>
  <div class="fgrid">
    <article v-for="f in features" :key="f.title" class="fcard">
      <div class="fcard__icon">
        <AppIcon :name="f.icon" />
      </div>
      <h3 class="fcard__title">{{ f.title }}</h3>
      <p class="fcard__desc">{{ f.desc }}</p>
    </article>
  </div>
</template>

<style scoped>
.fgrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.fcard {
  padding: 22px 20px 24px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.fcard:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-2);
}

.fcard__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.fcard__title {
  margin: 16px 0 8px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  border: none;
  padding: 0;
}

.fcard__desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13.5px;
  line-height: 1.8;
}

@media (max-width: 960px) {
  .fgrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .fgrid {
    grid-template-columns: 1fr;
  }
}
</style>
