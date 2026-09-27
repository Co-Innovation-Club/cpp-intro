<script setup lang="ts">
const lines: { n: number; html: string }[] = [
  { n: 1, html: '<span class="tk-p">#include</span> <span class="tk-h">&lt;iostream&gt;</span>' },
  { n: 2, html: '<span class="tk-k">using</span> <span class="tk-k">namespace</span> <span class="tk-ns">std</span>;' },
  { n: 3, html: '' },
  { n: 4, html: '<span class="tk-k">int</span> <span class="tk-f">main</span>()' },
  { n: 5, html: '{' },
  { n: 6, html: '    <span class="tk-ns">cout</span> &lt;&lt; <span class="tk-s">"Hello, world!"</span>;' },
  { n: 7, html: '    <span class="tk-k">return</span> <span class="tk-n">0</span>;' },
  { n: 8, html: '}' }
]

const consoleLines: { cls: string; text: string }[] = [
  { cls: 'is-cmd', text: 'g++.exe untitled1.cpp -o untitled1.exe' },
  { cls: 'is-ok', text: '编译成功，用时0.42秒' },
  { cls: 'is-out', text: 'Hello, world!' },
  { cls: 'is-dim', text: '进程退出，返回值: 0' }
]
</script>

<template>
  <div class="ide" aria-hidden="true">
    <div class="ide__chrome">
      <span class="ide__dot ide__dot--red" />
      <span class="ide__dot ide__dot--yellow" />
      <span class="ide__dot ide__dot--green" />
      <span class="ide__file">untitled1.cpp</span>
      <span class="ide__badge">F11 运行</span>
    </div>

    <div class="ide__editor">
      <div v-for="line in lines" :key="line.n" class="ide__line">
        <span class="ide__gutter">
          <span v-if="line.n === 6" class="ide__bp" />
          {{ line.n }}
        </span>
        <code class="ide__code" v-html="line.html" />
      </div>
    </div>

    <div class="ide__panel">
      <div class="ide__panel-head">
        <span class="ide__panel-title">编译并运行</span>
        <span class="ide__panel-tab">编译器</span>
      </div>
      <div class="ide__panel-body">
        <p v-for="(l, i) in consoleLines" :key="i" :class="l.cls">{{ l.text }}</p>
      </div>
    </div>

    <div class="ide__status">
      <span>行:8/8 列:2</span>
      <span class="ide__spacer" />
      <span>UTF-8(ASCII)</span>
      <span class="ide__sep">·</span>
      <span>插入</span>
      <span class="ide__sep">·</span>
      <span>GCC 11.5.0 64-bit Debug</span>
    </div>
  </div>
</template>

<style scoped>
.ide {
  --ide-bg: #0f1116;
  --ide-chrome: #191c23;
  --ide-border: rgba(255, 255, 255, 0.09);

  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: var(--ide-bg);
  border: 1px solid var(--ide-border);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 26px 60px -24px rgba(0, 0, 0, 0.75);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.7;
  text-align: left;
}

.ide__chrome {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 14px;
  background: var(--ide-chrome);
  border-bottom: 1px solid var(--ide-border);
}

.ide__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex: none;
}

.ide__dot--red { background: #e0604f; }
.ide__dot--yellow { background: #d8a441; }
.ide__dot--green { background: #7fae5a; }

.ide__file {
  margin-left: 10px;
  color: #cfd4dc;
  font-size: 12.5px;
}

.ide__badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 5px;
  background: rgba(217, 96, 63, 0.16);
  border: 1px solid rgba(217, 96, 63, 0.32);
  color: #e8937c;
  font-size: 11px;
  letter-spacing: 0.02em;
}

.ide__editor {
  padding: 14px 0 18px;
}

.ide__line {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 0 14px;
  min-height: 22px;
}

.ide__line:nth-child(4) {
  background: rgba(217, 96, 63, 0.1);
  box-shadow: 2px 0 0 #d9603f inset;
}

.ide__gutter {
  position: relative;
  width: 22px;
  flex: none;
  text-align: right;
  color: #464d59;
  font-size: 12px;
  user-select: none;
}

.ide__bp {
  position: absolute;
  left: -9px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9603f;
  box-shadow: 0 0 8px rgba(217, 96, 63, 0.7);
}

.ide__code {
  color: #c8cdd6;
  white-space: pre-wrap;
  word-break: break-all;
}

.ide__code :deep(.tk-p) { color: #9a7fd5; }
.ide__code :deep(.tk-h) { color: #8ec07c; }
.ide__code :deep(.tk-k) { color: #e0704c; }
.ide__code :deep(.tk-f) { color: #61afef; }
.ide__code :deep(.tk-ns) { color: #56b6c2; }
.ide__code :deep(.tk-s) { color: #8ec07c; }
.ide__code :deep(.tk-n) { color: #d19a66; }

.ide__panel {
  border-top: 1px solid var(--ide-border);
  background: #0c0e12;
}

.ide__panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 6px;
  font-size: 11.5px;
}

.ide__panel-title { color: #8b94a3; }

.ide__panel-tab {
  padding: 2px 8px;
  border-radius: 5px 5px 0 0;
  background: rgba(255, 255, 255, 0.06);
  color: #cfd4dc;
}

.ide__panel-body {
  padding: 4px 14px 12px;
  font-size: 12.5px;
}

.ide__panel-body p { margin: 2px 0; }

.is-cmd { color: #6b7482; }
.is-ok { color: #7fae5a; }
.is-out { color: #d7dce4; }
.is-dim { color: #5c6370; }

.ide__status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: rgba(217, 96, 63, 0.14);
  border-top: 1px solid var(--ide-border);
  color: #b7bec9;
  font-size: 11.5px;
}

.ide__spacer { flex: 1; }
.ide__sep { color: #4c5461; }
</style>
