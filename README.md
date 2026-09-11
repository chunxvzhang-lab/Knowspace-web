# KnowSpace Web

KnowSpace 的产品官网与内置文档中心 —— 纯静态、无后端的前端项目。

KnowSpace 本体是一个本地优先（local-first）的个人知识工作台。本仓库只承载它的对外站点：
产品落地页 + 站内文档中心，构建产物为纯静态文件，可直接托管在任意 CDN 上。

- 上游主项目：[chunxvzhang-lab/KnowSpace](https://github.com/chunxvzhang-lab/KnowSpace)
- 部署方式：Vercel，见 [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md)

## 技术栈

| 项 | 选型 |
|---|---|
| 构建 | Vite 8（Rolldown + Oxc） |
| 框架 | React 18 + TypeScript（`strict: true`） |
| 样式 | 原生 CSS + CSS 变量设计令牌（`src/index.css`） |
| 字体 | 自托管 Plus Jakarta Sans / Fira Code（`public/fonts/`） |
| 国际化 | 轻量自建 i18n（`src/i18n/`），zh / en 双语 |
| 主题 | dark / light / e-ink 三套 |

不引入 Tailwind，也不引入任何 UI 框架 —— 样式统一走设计令牌。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:5200
```

Windows 下也可直接双击 `start.bat`。

## 构建与预览

```bash
npm run build    # 产物输出到 dist/
npm run preview  # 本地预览构建结果
```

`vite.config.ts` 中设置了 `base: "./"`，产物全部使用相对路径，因此可以放在任意子目录下静态托管。

## 目录结构

```
src/
  components/   页面区块与交互组件
  data/         内容数据（与展示组件解耦，改文案不动组件）
  i18n/         文案与语言上下文（types.ts 对结构做强约束，zh / en 必须成对新增）
  utils/        跨组件复用的纯逻辑
public/         静态资源（字体、产品截图、社交分享图）
docs/preview/   页面预览截图
```

## 部署

见 [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md)。本仓库根目录即应用根目录，Vercel 无需额外设置 Root Directory。

## 规划

后续改进项（含已知限制与对应方案）见 [`ROADMAP.md`](./ROADMAP.md)。
