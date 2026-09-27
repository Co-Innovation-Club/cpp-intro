<script setup lang="ts">
import { computed } from 'vue'

/**
 * 描边风格图标集，供 FeatureGrid 使用。
 * 未收录的名字落到通用文档图标，新卡片、新章节不配图也能用。
 */
const props = withDefaults(
  defineProps<{ name?: string; size?: number }>(),
  { name: 'file', size: 20 }
)

const PATHS: Record<string, string[]> = {
  box: [
    'M12 2.7 21 7v10l-9 4.3L3 17V7l9-4.3Z',
    'M3 7l9 4.3L21 7',
    'M12 11.3V21'
  ],
  spark: ['M13 3 5 14h6l-1 7 8-11h-6l1-7Z'],
  play: ['M7 4.8 19.5 12 7 19.2V4.8Z'],
  terminal: [
    'M3.5 5.5h17v13h-17z',
    'M7 10l2.6 2.6L7 15.2',
    'M12.6 15.4h4.4'
  ],
  file: [
    'M6 3.5h8.5L19 8v12.5H6Z',
    'M14 3.5V8h5',
    'M9.5 13h5M9.5 16.5h5'
  ]
}

const paths = computed(() => PATHS[props.name] ?? PATHS.file)
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  display: block;
  flex: none;
}
</style>
