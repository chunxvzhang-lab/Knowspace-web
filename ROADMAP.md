# KnowSpace Web · 后续更新规划

梳理日期：2026-09-11
基线文档：`PROJECT_OVERVIEW.md`（项目梳理）· `PLATFORM_AUDIT.md`（平台检查）· `CONTACT_SECTION.md`（联系区块交付）

---

## 一、总览

前几轮已清掉全部「代码质量」与「交付质量」的历史问题（依赖声明、外链 404、资源体积、移动端断点、a11y 空白、SHA-256 校验、页脚联系方式、导航适配）。本规划面向**下一阶段**。

| # | 优先级 | 事项 | 类型 | 关键证据 |
|---|---|---|---|---|
| 1 | 🔴 P0 | 主题选择不持久化 | 体验缺陷 | `App.tsx:19` 硬编码 `'dark'`，全项目仅语言用了 localStorage |
| 2 | 🔴 P0 | `og:image` 用相对路径 | 分发缺陷 | `index.html` 的 `./social-card.jpg`，OG 协议要求绝对 URL |
| 3 | 🟡 P1 | `icon.png` 102.8 KB 用于 38px 显示 | 性能 | 仅被 `Navbar.tsx:98` / `Footer.tsx:53` 引用 |
| 4 | 🟡 P1 | ≤390px 主导航不可见 | 可用性 | 品牌块 173px + 控件 316/356px 吃满宽度 |
| 5 | 🟡 P1 | 无 `robots.txt` / `sitemap.xml` | SEO | `public/` 下均缺失 |
| 6 | 🟡 P1 | 无 URL 路由，不可深链接 | 架构 | `activeView` 为内存 state（已两次待确认） |
| 7 | 🟢 P2 | 无 PWA（manifest / Service Worker） | 能力 | 与「本地优先」定位高度契合，当前为零 |
| 8 | 🟢 P2 | 单 bundle 280 KB，无代码分割 | 性能 | `chunkSizeWarningLimit: 1200` 掩盖告警 |
| 9 | 🟢 P2 | 文档图缺懒加载 | 性能 | `DocsViewer.tsx:196`、`:271` |
| 10 | 🟢 P2 | 无结构化数据（JSON-LD） | SEO | `index.html` 中 `ld+json` 计数为 0 |
| 11 | 🟢 P2 | 无 `README.md` | 仓库门面 | 根目录缺失 |
| 12 | 🟢 P2 | `index.html` 残留编辑器属性 | 冗余 | 大量 `data-page-node-id` |
| 13 | 🔵 P3 | 无 lint / test / CI | 工程化 | `package.json` 仅 dev/build/preview |
| 14 | 🔵 P3 | 无部署配置 | 交付 | 纯静态站但无任何部署描述 |
| 15 | 🔵 P3 | 内联 style 353 处 | 可维护性 | 历史遗留 |
| 16 | 🔵 P3 | 上游数据需人工同步 | 流程 | 版本/体积/哈希全靠手改，易遗漏 |

---

## 二、🔴 P0 · 建议优先处理

### 1. 主题选择不持久化

**问题**：用户在导航切换 `light` / `eink` 主题后，刷新页面即回到 `dark`。

**证据**：`App.tsx:19` `useState<'dark'|'light'|'eink'>('dark')` 为硬编码初始值；全项目 `localStorage` 仅出现在 `LanguageContext.tsx`（语言用），主题无任何持久化。

**影响**：三主题（含 e-ink 阅读模式）是产品卖点，偏好丢失直接削弱体验。语言能记住而主题不能，行为不一致更显突兀。

**方案**：
- 初始值改为惰性读取 `localStorage.getItem('knowspace_theme')`（与 `LanguageContext` 同模式，含 try/catch 兜底）
- 切换时写回 `localStorage`
- 可选进阶：无存储时回落到 `prefers-color-scheme`；`index.html` 加一段内联脚本在首帧前套用主题，避免闪烁

**依赖**：无 ｜ **风险**：低

---

### 2. `og:image` 使用相对路径

**问题**：`index.html` 中 `og:image` / `twitter:image` 指向 `./social-card.jpg`。

**证据**：OG 协议要求**绝对 URL**——爬虫不在页面 URL 的上下文中解析相对路径。Facebook、Twitter、微信等均按绝对 URL 抓取。

**影响**：社交平台分享卡片**大概率无图**。营销站的主要分发入口之一失效。

**方案**：改为 `https://<域名>/social-card.jpg`。

⚠️ **依赖：需要先确认部署域名**。项目当前无部署配置，也无域名记录。

**风险**：极低（改 2 行）｜ **前置**：域名确认

---

## 三、🟡 P1 · 重要

### 3. `icon.png` 体积与显示尺寸严重不匹配

**证据**：`public/icon.png` 为 256×256 / **102.8 KB**，但只被 `Navbar.tsx:98`（38×38）与 `Footer.tsx:53`（32×32）引用。`favicon.png`（64×64 / 9.1 KB）另有用途。

**影响**：首屏为两个 32–38px 的小图标付出 102.8 KB。即使 2× DPR 也只需 76px。

**方案**：新增 `icon-nav.png`（96×96，预计 ~8 KB）供导航与页脚使用；`icon.png` 保留 256px。**预计首屏省约 95 KB**（−92%）。

**风险**：低（需同步三套主题下的显示效果）｜ 原图备份已在 `.workbuddy/assets/icon-original-1024.png`

---

### 4. ≤390px 主导航不可见

**证据**：390px 视口下品牌块 173px + 控件块 316px(zh)/356px(en) 已吃满内容区，`.nav-links-container` 被压到 0 宽——「产品特性 / 在线画册与文档」**完全不可见**。

**影响**：手机访客失去全部内容导航，只能靠下载按钮与页脚。

**方案**：**汉堡菜单**——`≤768px` 时把主导航收进抽屉，控件仅保留下载 CTA + 菜单按钮。属移动端导航的结构性重构，需设计抽屉的交互与动效。

**风险**：中（涉及导航结构改动，需回归全部断点）× 768px 尚可接受（主导航完整），390px 才暴露

---

### 5. 缺少 `robots.txt` 与 `sitemap.xml`

**证据**：`public/` 下仅有图片、字体与卡片资源，无任何爬虫指引文件。

**影响**：搜索引擎收录效率与站点地图呈现受限。

**方案**：新增 `public/robots.txt` 与 `public/sitemap.xml`（列出 landing 与文档中心）。⚠️ sitemap 的内容同样**依赖正式域名**。

---

### 6. 无 URL 路由

**证据**：`App.tsx` 的 `activeView` 为内存 state，`navigate()` 只改 state。

**影响**：刷新或分享链接一律回到 landing；文档中心无法被直接链接或收录。

**方案（两条路线，需选择）**：
- **A · 轻量**：hash 同步（`#/docs`），不动依赖，改动小，满足分享与后退
- **B · 完整**：引入 `react-router`，支持真实路径与嵌套路由，但对纯静态托管需配 rewrite

**风险**：B 方案中（引入依赖 + 托管配置）；A 方案低

---

## 四、🟢 P2 · 优化

### 7. PWA（manifest + Service Worker）

与产品「**本地优先、数据私有**」的理念天然契合——站点本身可安装、可离线，是理念的延伸演示。

**方案**：`manifest.webmanifest`（图标集已基本齐备）+ 轻量 SW 缓存静态资源；`vite-plugin-pwa` 可省去手写。

### 8. 代码分割与体积

**证据**：单 JS 280.83 KB / gzip 90.17 KB；`vite.config.ts` 将 `chunkSizeWarningLimit` 设为 1200（默认 500），**实质是压掉告警而非解决问题**。

**方案**：`manualChunks` 拆分 vendor（react / lucide）；文档中心（`DocsViewer` + `docsManifest`）按需 `React.lazy` 加载。目标：landing 首屏不再携带文档数据。

### 9. 文档图懒加载

**证据**：`DocsViewer.tsx:196`、`:271` 的 `<img>` 无 `loading="lazy"`。（`BentoGrid`、`Hero`、`Footer` 的图片策略已正确。）

### 10. 结构化数据

加 `SoftwareApplication` JSON-LD（名称、版本、操作系统、下载地址、评分）——提升搜索结果呈现，且成本极低。

### 11. `README.md`

公开仓库缺少门面文档。建议包含：项目定位、技术栈、本地运行、构建与部署、目录结构，并链向 `PROJECT_OVERVIEW.md` / `PLATFORM_AUDIT.md`。

### 12. 清理编辑器残留属性

`index.html` 中大量 `data-page-node-id="..."`，来自可视化编辑器的编辑标记，对运行无任何作用但增加 HTML 体积与噪声。

⚠️ **注意**：若该页面仍会在可视化编辑器中继续编辑，删除这些属性可能影响编辑器识别节点。**建议先确认是否仍使用该编辑器**，否则保留亦可（体积影响很小，属噪声级）。

---

## 五、🔵 P3 · 工程化

| 事项 | 说明 |
|---|---|
| **lint** | 接入 ESLint（`typescript-eslint` + `react-hooks`），先只报错不阻断 |
| **test** | 纯静态站测试价值有限，优先覆盖纯逻辑（如 `clipboard.ts`、`i18n` 结构校验） |
| **CI** | GitHub Actions：`tsc --noEmit` + `build` + 产物体积记录 |
| **部署** | 写入部署配置与说明（Netlify / Vercel / Pages 任选，纯静态零后端） |
| **内联 style** | 353 处，可渐进下沉为 class；**不必集中重构**，改到哪个组件顺手带上即可 |
| **上游同步** | 发新版时的固定动作：`RELEASE_TAG` + 三个资产的 name/bytes/sha256/url，改错即安全误导 |

---

## 六、需要你决策的事项

以下三项**无法由代码侧决定**，是后续推进的前置：

1. **部署域名** —— 阻塞 #2（og:image 绝对 URL）与 #5（sitemap）。**部署方式与 Vercel 配置见 [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md)**——按该手册部署完即可拿到域名，同时解锁这两项
2. **路由方案** —— hash 轻量同步 vs 引入 react-router（#6）
3. **是否投入 PWA** —— 与产品理念契合，但属新增能力（#7）

---

## 七、建议执行顺序

分三批推进，每批内可独立交付、互不阻塞：

**第一批 · 零依赖速修**（不依赖任何决策，可立即做）
`#1 主题持久化` → `#3 icon 瘦身` → `#9 文档图懒加载` → `#12 清理编辑器属性` → `#10 JSON-LD` → `#11 README`

**第二批 · 需要决策后展开**
`#2 og:image` + `#5 robots/sitemap`（待域名）→ `#6 路由`（待方案）→ `#4 汉堡菜单`

**第三批 · 能力与工程化**
`#7 PWA` → `#8 代码分割` → `#13–16 工程化`

> 第一批全部为低风险改动，且能一次性消掉两个 P0；建议从这一批开始。
