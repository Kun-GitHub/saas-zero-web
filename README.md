# SaaS-Zero 前端项目

基于 **Ant Design Pro**（Umi Max 模板）的 SaaS 管理后台。配套后端项目见 [saas-zero](https://github.com/saas-zero/saas-zero)（go-zero + ent + Casbin 微服务）。

> 本 README 为项目综合指南（含对外使用说明）。**代码架构**细节见 [`AGENTS.md`](./AGENTS.md)。

| 模块 | 协议 | 端口 | 职责 |
|---|---|---|---|
| [saas-zero-gateway](https://github.com/saas-zero/saas-zero-gateway) | HTTP 代理 | `:18080` | 统一入口，路径转发，**不做鉴权** |
| [saas-zero-auth](https://github.com/saas-zero/saas-zero-auth) | HTTP + gRPC | `:18081` | 登录、验证码、JWT 签发/校验/刷新、用户信息/菜单/权限码 |
| [saas-zero-basedata](https://github.com/saas-zero/saas-zero-basedata) | HTTP + gRPC | `:18083 / :18084` | API 层（JWT/Casbin/操作日志中间件）→ RPC 层（Ent 业务 + 策略管理） |
| [saas-zero-etcd](https://github.com/saas-zero/saas-zero-etcd) | etcd | — | etcd 调试工具 |
| [saas-zero-common](https://github.com/saas-zero/saas-zero-common) | Go 库 | — | Mixin / 雪花 ID / bcrypt / JWT / 加密 / Casbin / 错误码等公共库 |
| [saas-zero-web](https://github.com/Kun-GitHub/saas-zero-web) | 前端项目 |

## 技术栈

| 技术 | 用途 | 版本 |
|---|---|---|
| **React** | UI 框架 | 19.1.0 |
| **Ant Design** | 组件库 | 5.25.4 |
| **Ant Design Pro** | 中后台 Pro 组件 | 2.7.19 |
| **Umi** | 框架 / 路由 / 构建 | 4.3.24 (via @umijs/max) |
| **antd-style** | CSS-in-JS | 3.7.0 |
| **TypeScript** | 类型系统 | 5.6.3 |
| **react-intl** | 国际化（umi 内置） | — |
| **@biomejs/biome** | 代码检查/格式化 | 2.0.6 |
| **Jest** | 单元测试 | 30.x |

## 功能特性

- **菜单驱动的权限路由**：页面路由访问跟随后端菜单（`/oauth/menus` → menuData），按钮级权限用 `usePermission().can(code)`
- **多租户登录**：tenantCode + 账号 + 密码 + 图形验证码，JWT 存 `sessionStorage`
- **完整业务模块**：用户 / 角色 / 菜单 / 部门 / 字典 / 租户 / 套餐 / API / 登录日志 / 操作日志
- **多标签页**：PageTabs + 右键菜单（关闭其他/右侧/全部/当前）
- **全量国际化**：zh-CN + en-US，所有文本走 `formatMessage`

## 页面清单

| 页面 | 状态 | 核心功能 |
|---|---|---|
| 登录 | ✅ | 双栏布局 + 验证码 + JWT 登录，登录后重新拉取菜单写入 menuData |
| 控制台 | ✅ | 真实数据统计卡片（用户/租户/角色/登录数） + 最近操作日志 + 系统状态 |
| 用户管理 | ✅ | CRUD ProTable + 批量删除 + 重置密码 + 分配角色 + TreeSelect 部门选择 |
| 角色管理 | ✅ | CRUD ProTable + 分配菜单 Tree + 分配 API 树（数据源 getMyApis，回显仅保留可授权范围） |
| 菜单管理 | ✅ | TreeTable CRUD |
| 部门管理 | ✅ | TreeTable CRUD |
| 字典管理 | ✅ | 左右双栏布局 + 字典 CRUD（含编辑/删除） + 字典数据 CRUD |
| 租户管理 | ✅ | ProTable CRUD + 状态切换 |
| 套餐管理 | ✅ | 卡片布局 CRUD |
| API管理 | ✅ | ProTable CRUD + 按类型/方法筛选 |
| 登录日志 | ✅ | ProTable 只读查询 |
| 操作日志 | ✅ | ProTable 只读查询 |
| 系统初始化 | ✅ | Steps 向导 + `/init/*` 全量初始化 |
| 修改密码 | ✅ | 头像下拉菜单弹窗 |
| 权限控制 | ✅ | 路由访问跟随后端菜单 menuData + 按钮级 usePermission |
| 多标签页 | ✅ | PageTabs + 右键菜单（关闭其他/右侧/全部/当前） |
| 国际化 | ✅ | 所有文本走 i18n（zh-CN + en-US），无硬编码中文 |

## 环境要求

- Node.js >= 20
- npm（推荐）或 yarn
- 后端服务已启动（etcd → basedata RPC → basedata API → auth → gateway，统一入口 `:18080`）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器 → http://localhost:8000
npm run start:dev
# 或
npx max dev
```

### 本地代理（`config/proxy.ts`）

开发环境所有 API 经过 gateway `:18080`：

```
/oauth/*  → http://127.0.0.1:18080  （网关 → auth 服务）
/system/* → http://127.0.0.1:18080  （网关 → basedata API）
/init/*   → http://127.0.0.1:18080  （网关 → basedata API，跳过认证）
```

## 命令速查

| 命令 | 说明 |
|---|---|
| `npm run dev` / `npm run start:dev` | 启动开发服务器（`MOCK=none`，走真实后端） |
| `npm run build` | 生产构建 |
| `npm run preview` | 构建并预览（:8000） |
| `npm run tsc` | TypeScript 类型检查 |
| `npm run lint` | Biome 代码检查 + 类型检查 |
| `npm run biome` | Biome 自动修复 |
| `npm run test` / `npm test` | Jest 单元测试 |
| `npm run analyze` | 构建 + 包体积分析 |

## 路由与布局

所有路由在 `config/routes.ts` 中定义，支持 `layout: false` 让页面脱离 ProLayout：

| 路由 | layout | 说明 |
|---|---|---|
| `/user/login` | `false` | 独立登录页，无侧栏/顶栏 |
| `/dashboard` | 默认 | 控制台仪表盘 |
| `/system/*` | 默认 | 用户/角色/菜单/部门管理 |
| `/tenant/*` | 默认 | 租户/套餐管理 |
| `/api` | 默认 | API 管理 |
| `/dict` | 默认 | 字典管理 |
| `/log/*` | 默认 | 日志查询 |
| `/init` | 默认 | 系统初始化（`hideInMenu`） |

页面路由访问受 `access.ts` 控制，**跟随后端菜单**：后端 `/oauth/menus` 下发了某菜单即可进入对应页面，按钮权限码只控制页面内按钮显隐。

## 目录结构（概览）

```
saas-zero-web/
├── config/              # Umi 配置（config.ts / routes.ts / proxy.ts / defaultSettings.ts）
├── src/
│   ├── app.tsx          # 入口：initialState、layout、request interceptors
│   ├── access.ts        # 权限映射（hasMenu / canManageXxx）
│   ├── utils/menu.ts    # 后端菜单树 → ProLayout menuData
│   ├── locales/         # 国际化（zh-CN + en-US）
│   ├── pages/           # 页面（user / dashboard / system / tenant / api / dict / log / account / init）
│   └── services/saas-zero/  # API 服务层（typings + 按模块封装）
└── tests/               # 测试
```

完整结构、数据流与编码约定见 [`AGENTS.md`](./AGENTS.md)。

## 更多文档

- [代码架构指南](./AGENTS.md) — 项目结构、数据流、API 约定、ID 规范、页面编码规范
- [后端主项目](https://github.com/saas-zero/saas-zero) — go-zero + ent + Casbin 微服务
