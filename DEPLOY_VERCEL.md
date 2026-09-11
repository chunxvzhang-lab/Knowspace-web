# KnowSpace Web · Vercel 部署手册

适用对象：本仓库（KnowSpace 产品营销站 + 内置文档中心）
整理日期：2026-09-11 · 于仓库从 KnowSpace 主仓库拆分为独立仓库后修订

---

## 一、仓库结构

本项目是**独立仓库**，根目录即应用根目录：

```
Knowspace-web/                     ← git 根，remote = Knowspace-web 仓库
├── package.json     name: knowspace-web
├── index.html / src/ / public/
├── vite.config.ts
└── docs/preview/    ← 页面预览截图（不参与构建）
```

| 事实 | 值 |
|---|---|
| 仓库 | `https://github.com/chunxvzhang-lab/Knowspace-web.git` |
| 分支 | `main` |
| 构建产物 | `dist/`（已被 `.gitignore` 忽略，不入库） |
| 是否 npm workspace | **否**，自包含（自带 `package-lock.json`） |
| 上游主项目 | `chunxvzhang-lab/KnowSpace`（桌面端，与本仓库相互独立） |

> **历史沿革（避免误判）**：本仓库原先作为 `web/` 子目录存在于 KnowSpace 主仓库内，主仓库根目录**自己也是一个 Vite 应用**。
> 在那套结构下，部署时必须手动把 Root Directory 设为 `web`，否则构建出来的是主项目。
> **拆分后这个坑已不存在** —— 本仓库根目录就是应用根目录。

---

## 二、构建配置对照表

Vercel 能自动识别 Vite，以下为**确认过的最终值**：

| 配置项 | 值 | 说明 |
|---|---|---|
| Framework Preset | **Vite** | 自动检测，无需手改 |
| **Root Directory** | **留空（仓库根）** | ✅ 保持默认即可，**不要**再填 `web` |
| Build Command | `npm run build` | 即 `tsc && vite build`，默认即可 |
| Output Directory | `dist` | Vite 预设自动填为 `dist` |
| Install Command | `npm install` | 默认即可；使用 `package-lock.json` |
| Node.js Version | **默认（当前为 24.x）** | 满足 Vite 8 要求的 `^20.19 \|\| >=22.12`，**无需配置** |
| 环境变量 | **无** | 纯静态站，无后端、无密钥 |

> **Node 版本说明**：Vercel 默认使用最新 LTS（当前 24.x），本项目可直接用默认值。若将来需要固定版本，在 `package.json` 加 `"engines": { "node": "22.x" }`（`engines` 优先级高于 Dashboard 设置）。
> ⚠️ **不要固定为 `20.x`** —— Node 20 将于 2026-10-01 在 Vercel 弃用。

---

## 三、方式 A：Git 集成部署（推荐）

适合持续迭代：推送即部署，PR 自动生成预览 URL。

### 步骤

1. 确认代码已推送到 `main`（`git status` 干净、`git log` 可见提交）
2. 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 账号授权并选择 `chunxvzhang-lab/Knowspace-web`
3. **Root Directory 保持默认（仓库根）** —— 本仓库不含其他子项目
4. 确认 Framework Preset 显示为 `Vite`（应自动识别）
5. 其余保持默认，点击 **Deploy**
6. 首次构建约 1–2 分钟，成功后得到 `https://<项目名>.vercel.app`

### 后续

- 每次 `git push` 到 `main` → 自动部署到生产环境
- 其他分支 / PR → 自动生成独立的预览 URL
- 在 **Project Settings → Git** 中可关闭「自动部署」或用 Ignored Build Step 过滤

> 因为本仓库只包含这一个前端项目，**不再需要**按路径过滤构建的 Ignored Build Step 配置。

---

## 四、方式 B：Vercel CLI 部署

适合本地快速验证或不走 Git 集成的场景。

```bash
# 1. 安装（全局）
npm i -g vercel

# 2. 在仓库根目录登录并关联
cd <本仓库根目录>
vercel login
vercel link          # 首次会引导创建/关联项目，Root Directory 保持当前目录

# 3. 部署到预览环境
vercel

# 4. 部署到生产环境
vercel --prod
```

> **注意**：`vercel` 命令必须在**本仓库根目录**执行。由于不是 npm workspace，无需 `vercel link --repo`。

---

## 五、部署完成后必做

### 1. 拿到正式域名

`https://<项目名>.vercel.app`，或在 **Settings → Domains** 绑定自有域名（如 `knowspace.xxx.com`）。

### 2. 回填 `og:image` 的绝对 URL ← **解决了 ROADMAP 的 P0**

当前 `index.html` 中：

```html
<meta property="og:image" content="./social-card.jpg" />
<meta name="twitter:image" content="./social-card.jpg" />
```

OG 协议要求**绝对 URL**，爬虫不会基于页面地址解析相对路径。**换成正式域名**：

```html
<meta property="og:image" content="https://<正式域名>/social-card.jpg" />
<meta name="twitter:image" content="https://<正式域名>/social-card.jpg" />
```

改完推送即可生效。**这一步之前一直做不了，正是因为缺域名——部署完就解锁了。**

### 3. 生成 `robots.txt` 与 `sitemap.xml`

放到 `public/` 下，Vite 会原样复制到 `dist/`：

```
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://<正式域名>/sitemap.xml
```

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://<正式域名>/</loc><priority>1.0</priority></url>
</urlset>
```

---

## 六、已知注意事项

### 1. `base: './'` 与将来引入路由的冲突 ⚠️

`vite.config.ts` 目前是 `base: './'`（相对路径），保证产物可放在任意子路径下静态托管。**当前无路由，无需 SPA rewrite，一切正常。**

但**一旦引入前端路由**（如 `react-router`），就需要在仓库根的 `vercel.json` 加 fallback：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

此时**必须同时把 `base` 从 `'./'` 改为 `'/'`**。原因：把 `./assets/x.js` 放在 `/docs` 这类深层路径下，浏览器会解析成 `/docs/assets/x.js` → 404。

**即：加路由 = 改 `base` + 加 `vercel.json`，两件事必须一起做。**

### 2. 部署保护

Vercel 对新项目的 **Preview** 部署默认可能开启保护（需登录才能访问）。生产域名公开可访问。若需要把预览链接发给他人，去 **Settings → Deployment Protection** 调整。

### 3. 免费额度

Hobby 计划的静态站额度（约 100 GB/月带宽）对营销站绰绰有余，且无服务器函数消耗。

---

## 七、部署后验证清单

部署完成后逐项确认：

- [ ] 首页正常渲染，三套主题（dark / light / e-ink）切换正常
- [ ] **导航 4 个锚点可见**（核心能力 / 五维空间 / 在线演练 / 竞品对比）—— 桌面宽度下
- [ ] **页脚联系区块完整**：邮箱、Telegram 二维码卡、两个复制按钮
- [ ] 图片全部加载（无裂图）—— 尤其 `docs/preview` 与 `images/`
- [ ] 字体加载正常（Plus Jakarta Sans / Fira Code 自托管，应无外部字体请求）
- [ ] 命令面板 `Ctrl + K` 可打开，↑↓/↵ 键盘导航可用
- [ ] 下载按钮指向 GitHub Releases 且可达
- [ ] SHA-256 校验面板显示真实哈希
- [ ] `https://<域名>/social-card.jpg` 可直接访问（这是 og:image 生效的前提）
- [ ] 分享链接到社交平台，确认卡片**有图**（改完绝对 URL 后）

---

## 八、常见问题

| 现象 | 原因 | 处理 |
|---|---|---|
| 部署后是「主项目界面」而非营销站 | 误把 Root Directory 填成了 `web` | 本仓库根目录即应用根，把 Root Directory 清空 |
| 部署内容比本地旧 | 改动未 commit/push | 提交并推送后重新部署 |
| 构建报 Node 版本不符 | 手动设了过低的版本 | 移除 `engines` 或改用 `22.x`/`24.x` |
| 构建报 `tsc` 错误 | 类型检查未通过（`build` 脚本含 `tsc`） | 本地先跑 `npm run build` 确认通过再推送 |
| 找不到 `dist` 产物 | Output Directory 不对 | 确认 Output = `dist` |
| 页面资源 404 | 若已加路由但 `base` 仍为 `'./'` | 按第六节第 1 条同步修改 |
| 社交分享无图 | `og:image` 仍是相对路径 | 按第五节第 2 条改为绝对 URL |

---

## 附：本地构建验证（推送前建议执行）

```bash
cd <本仓库根目录>
npm run build          # tsc + vite build，确认零错误
npx serve dist         # 或 python -m http.server -d dist 5311
```

产物位于 `dist/`（约 5.4 MB，其中 `images/` 占 4.6 MB、字体 212 KB、JS 280 KB、CSS 14 KB）。
