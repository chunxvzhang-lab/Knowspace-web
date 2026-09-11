# KnowSpace Web · 平台检查报告

> 检查时间：2026-09-10 23:11 · 对象：`knowspace-web` v2.0.0
> 方法：依赖审计（npm audit）· 构建产物分析 · 静态代码扫描（脚本 + 正则）· 资源引用比对 · 外链 HTTP 探测

---

## 〇、优化执行结果（同日 23:15 更新）

本轮共执行 7 项优化，全部通过构建与运行时验证。

| # | 优化项 | 结果 |
|---|---|---|
| 1 | 删除 2 个孤儿图标文件 | `public/images` 38 张 → 36 张，16 MB → 14 MB |
| 2 | 图标压缩 | `icon.png` 1162.9 → **102.8 KB**；`favicon.png` 1162.9 → **9.1 KB**；首屏图标体积 **2325.8 → 111.9 KB（-95.2%）** |
| 3 | 移动端适配 | 布局下沉为 `.docs-layout` / `.docs-sidebar` / `.docs-content` / `.diff-grid` 四个 class，新增 900px / 768px 两档断点 |
| 4 | 无障碍 | `aria-*` 属性 **0 → 15**；模态框补 `role="dialog"` / `aria-modal`；6 处 `div onClick` 补 `role`+`tabIndex`+`onKeyDown` |
| 5 | **命令面板键盘导航** | 补齐 UI 承诺但从未实现的 ↑↓ 导航 / ↵ 执行，含选中高亮与自动滚动 |
| 6 | 字体自托管 | 11 个 woff2（196 KB）落地 `public/fonts/`，清除 `fonts.googleapis.com` 外链（原为**渲染阻塞**资源） |
| 7 | 预览图归档 | 11 张 `preview-*.png`（8 MB）移入 `docs/preview/` |

**产物体积**：`dist` 19 MB → **15 MB**
**构建状态**：`tsc` 类型检查 + `vite build` 通过（CSS 9.51 kB / JS 264.13 kB，1589 模块）
**运行时验证**：`/`、`/fonts/fonts.css`、woff2、`/icon.png`、`/favicon.png`、产品截图 全部 200
**原图备份**：`.workbuddy/assets/icon-original-1024.png`（1103.4 KB）

> **本轮新增发现**：命令面板底部显示「↑↓ 导航 / ↵ 确认 / Esc 退出」，但代码只实现了 Esc——方向键与回车**从未绑定**。这是原检查未发现的隐藏缺陷，已一并修复。

**未执行（第一轮）**：38 张截图转 WebP、Vite 8 升级——见第七节状态表。

---

## 〇之二、交互修复结果（同日 23:40）

针对三项交互缺陷的修复，全部通过构建与运行时验证。

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| 1 | 下载链接 4 处 404 | 仓库名与资产文件名**均错误** | 统一到 `chunxvzhang-lab/KnowSpace`；抽 `REPO_URL` / `RELEASES_URL` 常量；补 `target="_blank" rel="noopener noreferrer"` |
| 2 | 点「在线画册」跳到底部 | Navbar 的视图切换只调 `setActiveView`，**漏了滚动重置**（Hero / Footer / 命令面板都有，唯独导航栏没有） | `App.tsx` 加 `useLayoutEffect`，在**绘制前**统一归零滚动（`behavior: 'instant'`，绕过 CSS 的 smooth） |
| 3 | 导航横线不跟随 | 4 个锚点是纯 `<a>`，**从来没有 active 状态**，只有 `:hover` 下划线，移开即消失 | `Navbar.tsx` 实现 scroll-spy（rAF 节流 + 100px 偏移），下划线跟随当前区块；点击时即刻激活 |
| 4 | 锚点被吸顶导航遮挡 | 无 `scroll-margin-top` | `index.css` 补 `section[id] { scroll-margin-top: 84px }`；并为 `prefers-reduced-motion` 关闭平滑滚动 |
| 5 | 下载体积文案错误、EXE 无入口 | 原写「~98 MB」而实际 152.4 MB；便携版未标体积；Releases 中的 EXE 安装包站内无任何入口 | i18n 按真实资产校正；新增 `msiAltExe` 字段 + MSI 卡片内 EXE 入口，同步在 `types.ts` 声明 |

**架构改进**：`App.tsx` 的 4 个视图切换入口原本各自手写 `setActiveView + scrollTo`，其中 Navbar 那条漏写——这正是问题 2 的来源。现已收敛为单一 `navigate()` 入口 + 一个 `useLayoutEffect`，从结构上消除同类遗漏。

---

## 〇之三、SHA-256 校验落地（同日 23:57）

**问题**：校验区块文案承诺「可在安装前使用 PowerShell Get-FileHash 进行校验」，但**站内不提供任何哈希值**——用户拿到提示却无从比对。与「命令面板宣称 ↑↓ 导航却未实现」属同一类缺陷：**UI 承诺与实现不一致**，静态扫描抓不到，需逐条核对文案与实际能力。

**修复**：新增 `src/data/releaseAssets.ts` 作为资产哈希的单一数据源（内容数据与展示组件解耦，符合项目既有约定），下载区据此渲染完整校验面板。

| 资产 | 字节数 | 站内展示体积 | SHA-256 |
|---|---|---|---|
| `KnowSpace-2.0.0.msi` | 159,752,192 | ~152 MB | `fd1d2f701f9821d62441ef9df3641a6da4ce82dfb065a354cade71bdc97fa2a1` |
| `KnowSpace-Setup-2.0.0.exe` | 147,483,535 | ~141 MB | `f597680c2ecb4c32b7e6aca9ed8e2ed828a001efcea2c91bbc2bcb36cf89b723` |
| `KnowSpace-win-x64-portable.zip` | 384,005,722 | ~366 MB | `ba1e2e2129a0c3846bb68d1a55483c38fe0a3edd24957522aa3f104662b2a6d8` |

**数据来源与交叉验证**：哈希取自 GitHub Releases API 的 `assets[].digest` 字段（平台官方值）。另外独立下载 `KnowSpace-2.0.0.msi` 在本地重算，结果与官方值**逐字符一致**，且下载字节数与 API 上报的 159,752,192 完全吻合——两条独立路径互证，数据源可信。

**面板能力**：每个资产展示文件名（可点击直达下载）、体积、完整哈希 + 一键复制；附 PowerShell 校验命令（同样可复制）与结果比对说明。复制逻辑为 `navigator.clipboard` → `execCommand('copy')` 两级降级，兼容非安全上下文（纯 http / file://）。

---

## 〇之四、截图转 WebP 与 Vite 8 升级（09-11 00:30）

两项此前被标记为「⏸ 待确认」的改动，本轮执行完毕。

### 4.1 截图 PNG → WebP

以 `Pillow` 质量 85 / method 6 转换，**逐文件校验尺寸与原图一致**，37 张全部可完整解码。

| 范围 | 转换前 | 转换后 | 变化 |
|---|---|---|---|
| 36 张产品截图（`public/images/`） | 13.24 MB | 4.46 MB | −66% |
| Hero 首屏主图 `screenshot.png` | 316.2 KB | 138.9 KB | −56% |
| **截图合计（37 张）** | **13.55 MB** | **4.56 MB** | **−8.99 MB（−66.3%）** |
| `dist/` 总体积 | 15 MB | 5.4 MB | **−64%** |

- 引用同步替换 **48 处**（`docsManifest.ts` 36 处 + `features.ts` 11 处 + `Hero.tsx` 1 处），替换后引用与实际文件 **1:1 完全吻合**（无断链、无孤儿）。
- `icon.png` / `favicon.png` **保持 PNG**——它们是品牌图标而非截图，且 favicon 用 PNG 兼容性最稳。
- `screenshot.png` 是唯一带 alpha 的图（圆角应用窗口，背景透明），已按 `RGBA` 保留透明通道。
- 原图全部备份于 `.workbuddy/assets/images-png-original/`（37 个文件，14 MB）。**本项目无 git 仓库**，该备份是唯一回滚路径。

### 4.2 修正一处因转换引入的回归：社交分享图

替换脚本最初只扫了 `src/`，**漏掉 `index.html`**，导致 `og:image` / `twitter:image` 仍指向已删除的 `screenshot.png`——社交平台抓取会全部失败。

修复时做了一个刻意的技术选择：**分享图不用 WebP 而用 JPEG**。

- 原因：各平台爬虫对 WebP 支持不一致（微信等尤其不稳），分享图裂开对营销站是实打实的损失；而分享图**不参与页面加载**，不必为它牺牲兼容性。
- 做法：新建 `public/social-card.jpg`（1200×675，JPEG q88），把透明背景**合成到实色底 `#0d1117`**（与 `index.html` 的 `theme-color` 一致）——JPEG 无 alpha，不铺底会出现黑块。
- 顺带补了 `og:image:type/width/height/alt` 与 `twitter:image:alt`（避免爬虫为测尺寸而额外抓取，alt 补上无障碍语义）。
- 结果：**316 KB → 80.4 KB**，兼容性与体积同时优于原方案。

### 4.3 Vite 5 → 8

| 项 | 升级前 | 升级后 |
|---|---|---|
| `vite` | 5.4.21 | **8.3.0** |
| `@vitejs/plugin-react` | 4.3.4 | **6.1.1** |
| 打包引擎 | Rollup + esbuild | **Rolldown + Oxc** |
| 漏洞（`npm audit`） | 2（esbuild moderate / vite high） | **0** |
| 模块数 | 1590 | 1574 |
| CSS 产物 | 12.55 kB | **11.97 kB** |
| JS 产物 | 268.80 kB / gzip 89.39 kB | 277.89 kB / gzip **89.44 kB** |

**关键点**：Vite 8 的依赖树里**已彻底没有 esbuild**（只剩 rolldown / lightningcss / postcss）。原先的两个漏洞也随之消失——不是靠版本号绕过，而是**从源头移除了问题组件**。

**配置改动**：`vite.config.ts` 移除了 `build.minify: "esbuild"`。该选项在 Vite 8 中已废弃，且会让 esbuild 重新回到依赖树（需手动装为 devDependency）；Vite 8 默认的 Oxc 压缩器已足够好。其余配置（`base: './'`、`server`、`target: 'esnext'`、`chunkSizeWarningLimit`）**无需改动**即可兼容。

**连带收益**：dev 环境漏洞一并消除——此前该漏洞「仅影响 dev server」，现在两端都干净。

### 4.4 验证

- `tsc` + `vite build` 通过（Vite 8，1574 模块）
- `npm audit` → **found 0 vulnerabilities**
- Vite 8 dev server：`/`、截图、图标、字体、分享图 全部 200，Content-Type 正确（`image/jpeg` / `image/webp`）
- **纯静态托管 `dist/` 验证**（模拟真实部署形态）：`index.html` 内所有 `./` 相对引用（JS / CSS / favicon / 字体 / 预加载）全部 200
- 37 张 WebP 强制完整解码（`im.load()`）全部通过，尺寸与备份原图逐一比对一致

---

## 一、总体结论

**代码质量优秀，工程质量薄弱。**

核心代码几乎没有技术债——零 `any`、零 `console`、零类型逃逸、副作用清理完整、主题变量三套完全对齐。问题集中在**交付层**：死链、资源冗余、移动端适配、无障碍支持。

| 维度 | 评级 | 说明 |
|---|---|---|
| 代码质量 | ✅ 优 | 无类型逃逸 / 异味 / XSS 风险 |
| 依赖健康 | 🟡 中 | 2 个漏洞（仅影响 dev），依赖树干净 |
| 构建产物 | 🟡 中 | JS 262.94 kB / gzip 86.62 kB 合理；但 dist 达 19 MB |
| 资源管理 | 🔴 差 | 同一张图存 4 份，38 张截图 16 MB 全未压缩 |
| 移动端适配 | 🔴 差 | 无 <1024px 断点，多处硬编码宽度 |
| 可访问性 | 🔴 差 | 全站 0 个 aria 属性，6 处键盘不可达 |
| 外链有效性 | 🔴 差 | 下载中心 4 处链接全部 404 |

---

## 二、✅ 通过项（无需改动）

1. **类型安全**：`strict: true` 全程生效，全项目无 `any` / `as any` / `@ts-ignore` / `@ts-expect-error`，构建期 `tsc` 零报错。
2. **无代码异味**：无 `console.*` 残留、无 `TODO` / `FIXME`、无 `eslint-disable`。
3. **无 XSS 风险**：全项目无 `dangerouslySetInnerHTML`，用户内容全部走 JSX 转义。
4. **副作用清理完整**：9 处 `useEffect` 全部正确清理。`CyberBackground` 的 canvas 动画已 `cancelAnimationFrame` + 移除 3 个全局事件监听。
5. **图片 alt 合规**：7 个 `<img>` 全部带 `alt` 属性。
6. **主题系统健壮**：三套主题（dark / light / eink）各 19 个变量，数量与命名完全对齐，无遗漏。
7. **中文字体回退完整**：`PingFang SC` → `Microsoft YaHei` → `WenQuanYi Micro Hei` 链路齐备，字体加载失败不破版。
8. **依赖树干净**：仅 8 个直接依赖，无冗余传递依赖。
9. **Tree-shaking 生效**：lucide-react 按需引入正常，未全量打包。

---

## 三、🔴 高危问题（建议立即处理）

### 3.1 下载中心 4 处外链全部 404 ✅ 已修复（同日 23:40）

**原问题**：4 处外链全部指向不存在的仓库 `github.com/knowspace/knowspace`。

| 位置 | 原链接（404） | 修复后 |
|---|---|---|
| `DownloadCenter.tsx:53` | `knowspace/knowspace/releases/download/v2.0.0/KnowSpace-Setup-2.0.0.msi` | `github.com/chunxvzhang-lab/KnowSpace/releases` |
| `DownloadCenter.tsx:95` | `.../KnowSpace-win-x64-v2.0.0-portable.zip` | 同上 |
| `DownloadCenter.tsx:118` | `knowspace/knowspace/releases` | 同上 |
| `Footer.tsx:73` | `knowspace/knowspace` | `github.com/chunxvzhang-lab/KnowSpace` |

**验证方式**：`curl` 探测，对照组 `github.com/facebook/react` 返回 200，排除网络因素。

**真实仓库**：`chunxvzhang-lab/KnowSpace`（公开），实测仓库主页与 Releases 页均返回 **200**。

**额外发现 —— 原代码连资产文件名也是错的**（即便仓库名改对，仍会 404）：

| 原代码写的文件名 | Releases 中的实际文件名 | 实际体积 |
|---|---|---|
| `KnowSpace-Setup-2.0.0.msi` | `KnowSpace-2.0.0.msi` | 152.4 MB |
| `KnowSpace-win-x64-v2.0.0-portable.zip` | `KnowSpace-win-x64-portable.zip` | 366.2 MB |
| — | `KnowSpace-Setup-2.0.0.exe`（另有） | 140.7 MB |

**修复方式**：链接抽为 `REPO_URL` / `RELEASES_URL` 两个常量统一维护；下载按钮指向 Releases 列表页（后续发新版本链接不失效）；三处外链全部补上 `target="_blank" rel="noopener noreferrer"`，避免用户跳离本站。

**体积文案已校正**（同日 23:48）：原「~98 MB」与实际（152.4 MB）严重不符，便携版则完全未标体积；此外 Releases 中的 **EXE 安装包此前站内没有任何入口**。现已按真实资产全部修正：

| 文案字段 | 修改后 | 对应实际资产 |
|---|---|---|
| `msiBtn`（zh/en） | 下载 MSI 安装包 **(~152 MB)** | `KnowSpace-2.0.0.msi` · 152.4 MB |
| `msiAltExe`（**新增字段**） | 或下载 EXE 安装包 **(~141 MB)** | `KnowSpace-Setup-2.0.0.exe` · 140.7 MB |
| `zipBtn`（zh/en） | 下载绿色便携版 **(.zip · ~366 MB)** | `KnowSpace-win-x64-portable.zip` · 366.2 MB |

`msiAltExe` 为新增 i18n 字段，已同步在 `types.ts` 的 `download` 接口中声明——该项目对文案结构做强约束，漏声明会直接编译失败。

### 3.2 图标资源 4 份重复，白占 3.5 MB

同一个 1024×1024 图（各 **1162.9 KB**）在项目中存了 4 份：

| 路径 | 是否被引用 | 是否进 dist |
|---|---|---|
| `public/icon.png` | ✅ 页面 logo（新改） | ✅ |
| `public/favicon.png` | ✅ 浏览器图标 | ✅ |
| `public/images/icon.png` | ❌ **从未引用** | ✅ 仍被复制 |
| `public/images/logo.png` | ❌ **从未引用** | ✅ 仍被复制 |

**图片引用比对结果**：源码实际引用 36 张，`public/images` 实存 38 张，多出的 2 张即上述孤儿文件。Vite 会**原样复制整个 `public/` 进 `dist/`**，所以这 2 份死资源还额外让部署包增重 2.33 MB。

**结论**：可安全删除 `public/images/icon.png` 与 `public/images/logo.png`，零影响，直接省 2.33 MB。

---

## 四、🟡 中危问题

### 4.1 移动端适配缺失

全站**仅 2 个媒体查询断点**（`max-width: 1220px`、`max-width: 1024px`），**没有 768px 及以下的手机断点**。

更棘手的是：组件大量使用**内联样式**（`style={{}}`），而内联样式优先级高于媒体查询——即使补断点也无法覆盖。以下硬编码在小屏必出问题：

| 位置 | 写法 | 移动端后果 |
|---|---|---|
| `DocsViewer.tsx:47` | `gridTemplateColumns: '320px 1fr'` | 侧栏固定 320px，主内容被压到极窄 |
| `ComparisonTable.tsx:24` | `minWidth: 800` | 表格横向溢出屏幕 |
| `InteractiveStage.tsx:315` | `gridTemplateColumns: '1fr 1fr'` | Diff 双栏在手机上各不足 180px |

**修复思路**：把这三个网格改为 `repeat(auto-fit, minmax(...))` 或下沉为 CSS class 再用媒体查询接管。

### 4.2 无障碍（a11y）几乎空白

- **全站 `aria-*` 属性数量：0**
- `CommandPaletteModal` 作为全屏模态框，缺 `role="dialog"` / `aria-modal="true"` / `aria-label`，屏幕阅读器无法识别为对话框
- **6 处非交互元素绑定 `onClick`**，且全部未补 `role` / `tabIndex` / `onKeyDown` → 键盘用户完全无法触发：

| 位置 | 元素 | 用途 |
|---|---|---|
| `CommandPaletteModal.tsx:87` | `<div>` | 遮罩层关闭 |
| `CommandPaletteModal.tsx:101` | `<div>` | 命令项 |
| `CommandPaletteModal.tsx:154` | `<div>` | 命令项 |
| `DocsViewer.tsx:182` | `<div>` | 文档模块卡片 |
| `DocsViewer.tsx:218` | `<div>` | 图片缩略图 |
| `Navbar.tsx:27` | `<div>` | Logo 点击回首页 |

**影响**：键盘用户无法使用命令面板、无法切换文档模块；`Ctrl+K` 打开面板后无法用键盘选择命令（只能靠 Esc 关闭，且面板内无焦点管理）。

### 4.3 图片资源未压缩

- `public/images` 共 **16 MB / 38 张**，全部 PNG，无 WebP / AVIF
- 单张最大 **612 KB**（`16-about-dialog.png`），另有 6 张 > 450 KB
- 文档中心会加载多张这类大图

**优化空间**：转 WebP 并配合 `srcset`，预计可压缩 60–80%（16 MB → 3–5 MB）。当前页面加载这些截图时首屏体验会明显受损。

### 4.4 依赖漏洞 2 个（仅影响开发环境）

```
esbuild <=0.24.2   moderate  开发服务器可被任意网站发起请求并读取响应
vite    <=6.4.2    high      依赖上述有漏洞的 esbuild 版本
```

**实际风险**：漏洞仅存在于 **dev server**，`npm run build` 产出的静态文件**不受影响**。若开发者本机不暴露 5200 端口到公网，风险可接受。

**修复代价**：`npm audit fix --force` 会升级到 **vite@8.3.0**，跨 3 个大版本（5 → 8），需回归验证 `vite.config.ts` 与 `@vitejs/plugin-react`（也应同步升级）。

### 4.5 Google Fonts 外链（国内可达性）

```
fonts.googleapis.com/css2?family=Fira+Code...&family=Plus+Jakarta+Sans
```

本机探测返回 200，但 `fonts.googleapis.com` 在**中国大陆网络环境下通常不可达**，请求会挂起至超时。

**缓解现状**：`display=swap` + 完整中文回退链保证了文字始终可读、不破版，所以**不会白屏**。但会拖慢首次渲染并产生无意义的等待请求。

**建议**：将两套字体（Plus Jakarta Sans / Fira Code）自托管到 `public/fonts/`，配合 `font-display: swap`；或直接移除外链，仅用系统字体栈（当前回退链已足够美观）。

---

## 五、🟢 低优先级优化

1. **dist 体积 19 MB**：其中约 16 MB 来自 `public/` 全量复制。清理孤儿图 + 压缩截图后可降到 5 MB 以内。
2. **无 URL 路由**：`activeView` 为内存 state，刷新回落地页、无法分享文档中心深链接。可引入 `react-router` 或手写 hash 路由（`#/docs`）。
3. **内联样式密度高**：`InteractiveStage.tsx` 73 处、`Hero.tsx` 53 处、`DocsViewer.tsx` 37 处。建议高频样式下沉为语义化 class，同时解决 4.1 的媒体查询失效问题。
4. **根目录 11 张 `preview-*.png`（8 MB）**：与 `public/images` 职责重叠，建议移入 `docs/preview/` 归档。
5. **单文件偏大**：`translations.ts` 796 行、`InteractiveStage.tsx` 476 行。可拆分。

---

## 六、对原梳理报告优化项的校验结论

| 原报告项 | 校验结果 | 说明 |
|---|---|---|
| P0 依赖声明缺失 | ✅ **已修复** | 本轮已验证：69 包安装、构建通过 |
| P1 无 URL 路由 | ✅ **属实** | 代码确认，影响不变 |
| P1 预览图冗余（8 MB） | ✅ **属实** | 实测 8.0 MB |
| P2 单文件体积偏大 | ✅ **属实** | 实测行数一致 |
| P2 内联样式占比高 | ✅ **属实，且需升级优先级** | 它不只是维护性问题，还**直接导致响应式失效**（见 4.1），建议提到 🟡 |
| Logo 1.19 MB 过重 | ⚠️ **比预估更严重** | 原判断为「1 份过大」，实测是**同一张图 4 份**，其中 2 份为死文件 |
| — | 🆕 **新增 2 项高危** | 下载链接全 404、移动端无断点 |

---

## 七、建议的修复顺序

| 优先级 | 动作 | 成本 | 收益 |
|---|---|---|---|
| 优先级 | 动作 | 状态 |
|---|---|---|
| **P0** | 删除 `public/images/{icon,logo}.png` 两个孤儿文件 | ✅ 已完成 |
| **P0** | 替换/确认 4 处下载链接 | ✅ 已完成（23:40，指向 `chunxvzhang-lab/KnowSpace`） |
| **P1** | 图标压缩（页面 logo + favicon 用） | ✅ 已完成 |
| **P1** | 修移动端：硬编码网格 + 补断点 | ✅ 已完成 |
| **P2** | a11y：模态框 role/aria + 键盘可达 | ✅ 已完成 |
| **P2** | 字体自托管（清除 Google Fonts 外链） | ✅ 已完成 |
| **P3** | 归档预览图 | ✅ 已完成 |
| **P1** | 37 张截图转 WebP（实际省 8.99 MB） | ✅ 已完成（09-11，含分享图回归修复） |
| **P3** | 升级 Vite 8 修复漏洞 | ✅ 已完成（09-11，`npm audit` → 0） |
| **P3** | 引入 URL 路由（深链接） | ⏸ 待确认 |

---

## 八、检查方法附录

```bash
npm audit                                    # 依赖漏洞
ls -la dist/assets/ && du -sh dist           # 产物分析
find public -name "*.png" -printf "%s\t%p\n" | sort -rn   # 资源体积排序
grep -oh "images/..." src/data/*.ts | comm -13 - <(ls public/images)  # 孤儿资源比对
grep -n "@media" src/index.css               # 断点清单
curl -sL -o /dev/null -w "%{http_code}" <url>  # 外链探测（含对照组）
```

静态扫描脚本同时对 `src/**/*.tsx` 做了 `<img>` 缺失 alt、非交互元素 `onClick`、`aria-*` 计数、`useEffect` 清理四项检查。
