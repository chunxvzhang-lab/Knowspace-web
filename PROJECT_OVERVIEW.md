# KnowSpace Web · 项目梳理报告

> 梳理时间：2026-09-10 · 项目版本 v2.0.0

---

## 一、项目定位

**KnowSpace 独立宣传站** —— 为产品「KnowSpace（现代化个人知识工作台）」打造的官方营销落地页 + 内置产品文档中心。

产品主张：本地优先（Local-First）、100% 数据私有、无限空间白板（JSON Canvas 1.0）、版本时间旅行、全库毫秒级混合检索、五维工作区、60FPS 知识星系图谱。

站点自身即产品能力的展示台，核心卖点是「交互式演示」而非静态文案。

---

## 二、技术栈

| 层面 | 选型 | 说明 |
|---|---|---|
| 构建 | Vite 5 | `base: "./"` 相对路径，可直接静态托管 |
| 框架 | React 18 + TypeScript | `strict: true`，`jsx: react-jsx` |
| 图标 | lucide-react | 全站唯一 UI 依赖 |
| 样式 | 原生 CSS + CSS 变量 | 无 Tailwind / styled-components，手写 492 行 Design Token |
| 路由 | 无路由库 | `useState` 手写视图切换（landing / docs） |
| 国际化 | 自研 Context | zh / en 双语，localStorage 持久化 |

刻意保持**零重型依赖**：无 UI 框架、无状态管理、无路由、无动画库（动画均为 CSS + Canvas 手写）。

---

## 三、目录结构

```
web/
├── index.html              入口，含完整 SEO / OG / Twitter 卡片 meta
├── vite.config.ts          端口 5200，target esnext
├── tsconfig.json           strict 模式
├── start.bat               Windows 一键启动（chcp 65001 + 自动开浏览器）
├── package.json            ⚠️ 见「六、待处理问题」
│
├── src/                    24 个文件 / 4646 行
│   ├── main.tsx            React 挂载
│   ├── App.tsx             顶层状态编排（主题 / 视图 / 命令面板）
│   ├── index.css           三主题 Design Token 系统
│   │
│   ├── components/         14 个组件
│   ├── i18n/               LanguageContext + translations(796行) + types(202行)
│   └── data/               内容数据层（与展示解耦）
│
├── public/                 静态资源
│   ├── images/             36 张产品截图（WebP，文档中心配图）
│   ├── fonts/              自托管字体（Plus Jakarta Sans + Fira Code，11 个 woff2）
│   ├── favicon.png / icon.png     品牌图标（保持 PNG）
│   └── screenshot.webp / social-card.jpg   Hero 主图 / 社交分享图（JPEG）
│
├── dist/                   ✅ 已构建产物（Vite 8 / 5.4 MB）
└── docs/preview/           11 张站点预览截图（历史截图归档）
```

---

## 四、核心架构

### 1. 顶层状态编排（App.tsx）

三个全局状态，全部收敛在 `AppContent`：

- `currentTheme: 'dark' | 'light' | 'eink'` → 通过 `useEffect` 写入 `document.body.className`，用类名驱动整套 CSS 变量
- `activeView: 'landing' | 'docs'` → 手写视图切换，切换时 `scrollTo(top)`
- `paletteOpen: boolean` → 绑定全局 `Ctrl/Cmd + K` 键盘事件

`App` 外层包裹 `LanguageProvider` 提供 i18n Context。

### 2. 页面叙事流（landing 视图）

```
Hero                 首屏 + 主题体验切换 + 悬浮卖点卡
SocialProofStrip     信任指标条（5 项核心指标）
BentoGrid            不对称特性网格（Bento 布局，4 张特性卡）
Workspace5D          五维工作区自由跃迁展示
InteractiveStage     ⭐ 三个可玩交互沙盒（核心亮点）
EngineeringTrust     工程可信度（5 根支柱）
ComparisonTable      竞品对比（vs Obsidian / Notion / Typora）
DownloadCenter       MSI / ZIP 双通道下载 + SHA 校验
FaqSection           分类 FAQ 手风琴
Footer               四栏导航 + 版权
```

### 3. 三主题系统（index.css）

同一套语义化变量名，三组值：

| 变量 | theme-dark（默认） | theme-light | theme-eink |
|---|---|---|---|
| 主背景 | `#070a12` 极客黑 | `#fbf9f4` 暖白 | `#f4f3ee` 纸白 |
| 文字 | 白 | 近黑 | 纯黑 |
| 强调色 | 青 / 靛 / 翠 / 琥珀 | 深色化版本 | 全灰阶（去色） |
| 光晕网格 | 三色 radial mesh | 双色 mesh | `none`（无网格） |

E-ink 主题刻意压低对比、去除彩色与渐变，模拟电子墨水屏。

### 4. 交互式演示台（InteractiveStage.tsx · 476 行，最复杂组件）

三个可切换的沙盒，均为纯前端模拟（无后端）：

- **Canvas 沙盒** —— 两个可拖拽节点（`mousedown` + `window` 事件监听），带边界钳制；一键「萃取」为 Markdown 长文预览
- **Diff 沙盒** —— Myers LCS 双栏逐行对比演示，带增删统计徽章与「还原」按钮
- **Search 沙盒** —— 检索语法 playground，支持 `tag:` / `link:` / 引号精确 / `-` 排除 四种 token 芯片

### 5. 数据层（src/data/）

内容与组件完全解耦，改文案/加条目无需动组件：

| 文件 | 行数 | 职责 |
|---|---|---|
| `docsManifest.ts` | 334 | 文档中心 20+ 模块定义（标题/分类/快捷键/配图/要点） |
| `features.ts` | 124 | Bento 特性卡 + 5 项信任指标 |
| `comparison.ts` | 71 | 四列竞品对比矩阵 |
| `faq.ts` | 38 | FAQ 问答条目 |

### 6. 国际化（src/i18n/）

- `translations.ts`（796 行）为全站最大文件，承载 zh / en 两套完整文案
- `types.ts` 用 TS 接口对文案结构做强约束 —— 漏翻字段会直接编译报错（这是个好设计）
- 语言偏好写入 `localStorage['knowspace_lang']`，默认 `zh`

### 7. 视觉增强（CyberBackground.tsx）

基于 `<canvas>` 的粒子星座背景：粒子漂浮 + 鼠标位置连线，随主题切换配色，独立占用一个全屏 canvas 图层。

---

## 五、运行方式

```bash
npm install        # 依赖声明已补全，直接安装即可
npm run dev        # 开发 → http://127.0.0.1:5200
npm run build      # tsc && vite build → dist/
npm run preview    # 预览构建产物
```

Windows 用户可直接双击 `start.bat`。

---

## 六、问题清单（含修复状态）

### ✅ P0 · 依赖声明缺失 —— 已修复

原 `package.json` **没有任何 `dependencies` / `devDependencies`**，也没有 lockfile；`node_modules/` 只剩 `.vite` 缓存目录，项目无法 `npm run dev` / `npm run build`。

**修复内容**：补全依赖声明 → 安装 → 生成 `package-lock.json`。

```json
"dependencies": {
  "lucide-react": "^0.454.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
},
"devDependencies": {
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1",
  "@vitejs/plugin-react": "^4.3.4",
  "typescript": "^5.6.3",
  "vite": "^5.4.11"
}
```

**验证结果**：`npm install` 装 69 个包 → `npm run build` 类型检查 + 打包通过（1589 模块，JS 262.94 kB / gzip 86.62 kB，CSS 8.64 kB）→ dev server 正常响应 200。

### 🟡 P1 · 无 URL 路由，不可深链接

`activeView` 是纯内存 state。刷新页面会回到 landing，也无法直接分享「文档中心」链接。若有分享需求，建议引入 `react-router` 或手写 hash 路由（`#/docs`）。

### 🟡 P1 · 根目录预览图冗余 —— 部分修复

11 张 `preview-*.png`（约 8MB）散落在根目录，同时 `public/images/` 已有 38 张产品截图。建议归入 `docs/preview/` 归档。

`.gitignore` **已补全**（忽略 `node_modules/`、`dist/`、日志与 IDE 文件），误提交风险已解除；预览图归档待定。

### 🟢 P2 · 单文件体积偏大

`translations.ts` 796 行、`InteractiveStage.tsx` 476 行。当前可接受；若继续增长，建议按「页面/组件命名空间」拆分翻译文件（如 `i18n/locales/zh.ts` + `en.ts`），并按沙盒拆分 InteractiveStage。

### 🟢 P2 · 内联样式占比高

组件大量使用 `style={{}}` 内联写法，与 `index.css` 中的 class 混用。建议将高频内联样式下沉为语义化 class，便于主题变量统一收口与后续维护。

---

## 七、品牌 Logo 变更记录

将站内品牌标识从「CSS 渐变方块 + lucide 星形图标」替换为产品应用图标 `icon.png`：

| 位置 | 原实现 | 现实现 |
|---|---|---|
| Navbar（38 × 38，圆角 10） | 渐变方块 + `Sparkles size={22}` | `<img src="./icon.png">` |
| Footer（32 × 32，圆角 8） | 渐变方块 + `Sparkles size={18}` | `<img src="./icon.png">` |
| favicon | `public/favicon.png` | 未改动（与 `icon.png` 为同一张图） |
| 页内装饰性 Sparkles | BentoGrid / InteractiveStage 共 3 处 | 保留（非品牌标识） |

**验证结果**：dev 编译产物与生产 bundle 均含 `icon.png` 引用；两处品牌位已无 Sparkles 残留。

### ⚠️ 遗留性能项

`icon.png` 与 `favicon.png` 均为 **1.19 MB**（1024 × 1024，同一张图重复存储）。该图在首屏仅以 38 px 渲染，却需完整下载 1.19 MB，对首屏加载影响明显。建议生成 128–256 px 压缩版（预计降至 20–40 KB）供页面与 favicon 使用，原图仅保留给安装包等场景。

---

## 八、小结

这是一个**工程完成度较高的产品落地页**：零重型依赖、三主题变量系统、中英双语强类型文案、内容与展示完全解耦。叙事流从「首屏吸引 → 特性铺陈 → 动手试玩 → 建立信任 → 竞品对比 → 引导下载」完整闭环，其中 InteractiveStage 的三个沙盒是区别于普通静态官网的核心差异点。

依赖声明已补全、类型检查与构建均通过，项目可直接运行（`npm run dev` → http://127.0.0.1:5200）。剩余为可选工程优化项。
