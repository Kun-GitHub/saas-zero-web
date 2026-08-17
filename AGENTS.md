# SaaS-Zero 前端代码架构指南

> 面向修改/新增本仓库代码的开发与 AI 代理。综合项目说明（技术栈、快速开始、命令速查）见 [`README.md`](./README.md)。

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

## 项目结构

```
saas-zero-web/
├── config/
│   ├── config.ts                  # Umi 主配置（插件、主题、代理、国际化）
│   ├── defaultSettings.ts         # ProLayout 默认设置（侧栏/顶栏主题、标题、Logo）
│   ├── proxy.ts                   # 本地开发代理（/oauth/ /system/ /init/ → 127.0.0.1:18080）
│   └── routes.ts                  # 前端路由表（含 access 属性 + layout 开关）
├── src/
│   ├── access.ts                  # 权限映射（hasMenu / canManageXxx，详见「授权模型」）
│   ├── app.tsx                    # 入口：initialState、layout、request interceptors
│   ├── components/                # 公共可复用组件
│   │   └── SelectLang/            # 语言切换组件
│   ├── locales/                   # 国际化翻译
│   │   ├── zh-CN.ts / en-US.ts    # 合并入口
│   │   ├── zh-CN/                 # 中文翻译包（pages component menu settings ...）
│   │   └── en-US/                 # 英文翻译包
│   ├── utils/
│   │   ├── menu.ts                # 后端菜单树 → ProLayout menuData（buildLayoutMenu / apiMenuToLayout）
│   │   └── permission.ts          # usePermission().can(code) 按钮级权限
│   ├── pages/
│   │   ├── 404.tsx                # 404 页面
│   │   ├── user/login/            # 登录页（双栏布局 + 验证码 + 登录后重拉菜单）
│   │   ├── dashboard/             # 控制台（真实数据统计 + 最近操作日志）
│   │   ├── system/user/           # 用户管理（CRUD + 批量删除 + 重置密码 + 分配角色）
│   │   ├── system/role/           # 角色管理（CRUD + 分配菜单 Tree + 分配 API）
│   │   ├── system/menu/           # 菜单管理（TreeTable CRUD + 图标选择器）
│   │   ├── system/dept/           # 部门管理（TreeTable CRUD + 添加下级）
│   │   ├── tenant/list/           # 租户管理（ProTable CRUD + 套餐/管理员选择）
│   │   ├── tenant/package/        # 套餐管理（卡片布局 + 分配菜单/API）
│   │   ├── api/                   # API 管理（树形 ProTable + 方法 Tag）
│   │   ├── dict/                  # 字典管理（左右双栏 + 字典/字典数据 CRUD）
│   │   ├── log/login-log/         # 登录日志（只读查询）
│   │   ├── log/operation-log/     # 操作日志（只读查询）
│   │   ├── account/center/        # 个人中心（资料编辑 + 修改密码）
│   │   └── init/                  # 系统初始化（Steps 向导 + 一键初始化）
│   └── services/
│       └── saas-zero/             # API 服务层（按模块封装，UI 层不直接写 request）
│           ├── typings.d.ts       # SaaS 命名空间类型定义（所有实体、请求、响应）
│           ├── index.ts           # 统一导出
│           ├── auth.ts            # 登录/验证码/用户信息/菜单/权限
│           ├── user.ts            # 用户 CRUD + assignRoles + resetPassword
│           ├── role.ts            # 角色 CRUD + assignMenus + assignApis
│           ├── menu.ts            # 菜单 CRUD
│           ├── dept.ts            # 部门 CRUD
│           ├── tenant.ts          # 租户 CRUD + changeStatus + getTenantUsers
│           ├── package.ts         # 套餐 CRUD + assignMenus + assignApis
│           ├── api.ts             # API CRUD + getMyApis（/system/api/mine，分配 API 弹窗数据源）
│           ├── dict.ts            # 字典 / 字典数据 CRUD（路径 /system/dictData/*）
│           └── log.ts             # 日志查询（/system/log/loginLog|operationLog/list）
```

## 核心数据流

### 应用启动（`app.tsx:getInitialState`）

```
app.tsx → getInitialState()
  ├── fetchUserInfo() → GET /oauth/userinfo → currentUser
  ├── getMenus() → /oauth/menus → buildLayoutMenu() → menuData（过滤 button 节点）
  └── settings ← defaultSettings
       ↓
initialState 注入 ProLayout → 用户头像/菜单/权限生效
```

> `getInitialState` 只在**应用启动**时执行一次。登录页登录成功后必须重新 `getMenus()` 并 `setInitialState({ currentUser, menuData })`，否则切换用户后左侧菜单仍是旧用户的（需手动刷新）。

### 登录（`pages/user/login/`）

```
POST /oauth/login { tenantCode, username, password, captchaId, captchaVal }
  → result.token → 存入 sessionStorage（键 'saas-zero-token'）
  → getMenus() → buildLayoutMenu() → menuData
  → getCurrentUser() + getPermissions() → userInfo
  → setInitialState({ currentUser: userInfo, menuData })
  → 跳转首页
```

### 请求链路（`app.tsx` interceptors）

1. **request interceptor**: 从 `sessionStorage` 读取 token，注入 `Authorization: Bearer <token>` 请求头
2. **response interceptor**: 检查 `response.data.code`（Axios 响应结构）→ `code===200` 时拆包返回 `data`；`!==200` 抛错
3. **error handler**: `code===401 || code===1004` 清除 token 并跳转到登录页

## API 请求约定

### 统一响应格式（后端强制）

```json
{
  "code": 200,
  "msg": "success",
  "data": { ... }
}
```

`@umijs/max` 内部使用 **Axios**（`app.tsx` 的 responseInterceptors 接收 `AxiosResponse` 对象，`response.data` 才是 JSON body）。框架默认 `resolve(res.data)` 返回 JSON body `{ code, msg, data }`，**不自动拆包**。

拦截器只负责：`code===200` 时拆包返回 `data`，`code!==200` 时抛错（errorThrower 不处理 code 字段），`code===401/1004` 时清 token 跳登录。

### 服务函数写法

```ts
export async function getUserList(params: SaaS.UserQuery) {
  return request<SaaS.PageResult<SaaS.SysUser>>('/system/user/list', {
    method: 'GET',
    params,
  });
}
```

- GET 参数用 `params` 字段（自动转为 query string）
- POST body 用 `data` 字段
- 类型参数 `<T>` 对应拆包后的 `data` 类型
- 所有路径相对 `/`，Umi 开发时通过 proxy 转发

### delete 请求

所有删除统一使用 `POST` + body `{ ids: number[] }`（匹配后端 `IdsReq`），不另写 `DELETE` 方法。

### 特殊处理

全局 response interceptor 已自动拆包（`code===200` 时返回 `body.data`），因此服务函数直接使用拆包后的数据：

```ts
export async function getCaptcha() {
  return request<SaaS.CaptchaResult>('/oauth/code', { method: 'GET' });
}
```

> 历史遗留：`auth.ts` 的 `getCaptcha` 里仍有一段手动拆包代码（判断 `res.code === 200` 再取 `res.data`）。早期后端返回 `{ code, msg, data }` 且拦截器未拆包时有必要；现在响应拦截器在 `app.tsx` 统一拆包，这段手动拆包是防御性冗余，可以删除。

## ID 字段规范（双字段模式）

前端 JS `Number` 只能安全表示 -2^53 ~ 2^53 的整数，Go `int64` 超出此范围会精度丢失。

所有响应类型采用**双字段模式**：

| 字段 | TS 类型 | 说明 |
|---|---|---|
| `id` | `number` | 整型 ID，用于展示/比较 |
| `idStr` | `string` | 字符串 ID，**所有 API 传参必须使用此字段** |

**关键规则：**
- `id` 是 `number` 类型，`idStr` 是 `string` 类型，两者不可混用
- 所有 API 请求（create/update/delete/detail/assignRoles/changeStatus 等）传 `id` 时，必须使用 `idStr` 的值
- ProTable 的 `rowKey` 必须使用 `"idStr"`（不要用 `"id"`）
- 请求 DTO 的 `id` 字段类型为 `string`，因为前端填入的是 `idStr` 的值
- 禁止使用 `r.idStr || r.id` 这种回退写法，后端始终返回 `id` + `idStr` 两个字段

## 类型定义

所有 SaaS 业务类型定义在 `typings.d.ts` 的 `declare namespace SaaS { }` 中，按实体分组：

| 组 | 类型 |
|---|---|
| 认证 | `CurrentUser`, `LoginParams`, `LoginResult`, `CaptchaResult` |
| 通用 | `PageResult<T>`, `EmptyResp`, `IdsReq` |
| 用户 | `SysUser`, `UserQuery`, `UserCreate`, `UserUpdate`, `UserAssignRoles`, `UserResetPassword` |
| 角色 | `SysRole`, `RoleQuery`, `RoleCreate`, `RoleUpdate`, `RoleAssignMenus`, `RoleAssignApis`, `SysRoleMenuIds`, `SysRoleApiIds` |
| 菜单 | `SysMenu`, `MenuCreate`, `MenuUpdate` |
| 部门 | `SysDept`, `DeptCreate`, `DeptUpdate` |
| 租户 | `SysTenant`, `TenantQuery` |
| 套餐 | `SysPackage` |
| API | `SysApi`, `ApiQuery` |
| 字典 | `SysDict`, `SysDictData` |
| 日志 | `SysLoginLog`, `SysOperationLog` |

## 状态管理

### 全局初始状态（`app.tsx:getInitialState`）

```ts
{
  settings: Partial<LayoutSettings>,
  currentUser?: SaaS.CurrentUser,
  loading?: boolean,
  fetchUserInfo?: () => Promise<SaaS.CurrentUser | undefined>,
}
```

- 通过 `useModel('@@initialState')` 在任意组件访问
- 由 Umi `initialState` 插件自动管理

### ProLayout 运行时配置（`app.tsx:layout`）

- `onPageChange`: 未登录时（无 currentUser）自动跳转到 `/user/login`
- `rightContentRender`: 用户头像下拉菜单（个人中心 / 修改密码 / 退出登录）
- `actionsRender`: 语言切换按钮
- `childrenRender`: PageTabs 多标签页 + 开发模式 SettingDrawer

## 授权模型（`access.ts`）

**页面路由访问跟随后端菜单（menuData）**：只要后端 `/oauth/menus` 下发了某菜单（如 `/log`），前端即可进入对应页面。按钮权限码（button 菜单 path）只用于页面内按钮显隐。

| 方法 | 逻辑 | 用途 |
|---|---|---|
| `isAdmin` | `isSuperAdmin(currentUser)`（default 租户 + admin 角色） | 超级管理员专属功能 |
| `canAdmin` | `isSuperAdmin` 或 `roleCodes` 含 `manager` 或 `hasMenu('/system')` | 管理后台操作 |
| `hasMenu(path)` | 从 `initialState.menuData` 收集所有 `path`，`admin || menuPaths.has(path) || hasPermission('menu:'+path)` | 页面级访问 |
| `routeFilter` | `admin` 或 `hasPermission('menu:'+route.name)` | 菜单/路由过滤兜底 |
| `canManageUsers` | `hasMenu('/system/user')` | 用户管理页面 |
| `canManageRoles` | `hasMenu('/system/role')` | 角色管理页面 |
| `canManageMenus` | `hasMenu('/system/menu')` | 菜单管理页面 |
| `canManageDepts` | `hasMenu('/system/dept')` | 部门管理页面 |
| `canManageTenants` | `hasMenu('/tenant/list')` | 租户管理页面 |
| `canManagePackages` | `hasMenu('/tenant/package')` | 套餐管理页面 |
| `canManageApis` | `hasMenu('/api')` | API管理页面 |
| `canManageDicts` | `hasMenu('/dict')` | 字典管理页面 |
| `canViewLogs` | `hasMenu('/log')` | 日志查看页面 |

按钮级权限用 `src/utils/permission.ts` 的 `usePermission().can(code)`（如 `system:user:create`），`isSuperAdmin` 恒为 true。

路由级权限控制通过 `config/routes.ts` 的 `access` 属性接入，Umi 自动根据 `access.ts` 返回值决定菜单可见性和路由拦截。

## 国际化

- 使用 Umi 内置的 `react-intl`，通过 `useIntl()` hook 获取 `formatMessage`
- 翻译键格式：`pages.module.key`、`entity.field`、`status.value`、`message.action`
- 配置文件：`src/locales/zh-CN/pages.ts`（中文），`src/locales/en-US/pages.ts`（英文）
- 语言切换：顶栏右侧 `SelectLang` 组件

```tsx
const intl = useIntl();
const f = (id: string) => intl.formatMessage({ id });
// 使用: <span>{f('pages.login.submit')}</span>
// 带参数: <span>{intl.formatMessage({ id: 'entity.totalRecords' }, { total: 100 })}</span>
```

## 页面编码规范

### 通用模式

```tsx
import { useIntl, useModel } from '@umijs/max';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import type { ActionType } from '@ant-design/pro-components';

const useStyles = createStyles(({ token }) => ({
  /* CSS-in-JS */
}));

const Page: React.FC = () => {
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();
  const f = (id: string) => intl.formatMessage({ id });
  const actionRef = useRef<ActionType>(null);
  // ...
};
```

### ProTable 查询/分页

```tsx
<ProTable<SaaS.SysUser, SaaS.UserQuery>
  actionRef={actionRef}
  request={async (params) => {
    const res = await getUserList({ ...params });
    return { data: res.list, success: true, total: res.total };
  }}
  columns={[...]}
  rowKey="idStr"
/>
```

### 删除/批量删除

所有删除使用 `POST` + `{ ids: number[] }` 请求，操作完成后 `actionRef.current?.reload()`。

### 弹窗编辑

- 新增：`open` + `onOpenChange` + `onOk`（call API + reload + close）
- 编辑：同上 + `editRecord` state + `initialValues` 填充表单

## 本地开发

```bash
cd saas-zero-web
npx max dev         # 启动 dev 服务器 → http://localhost:8000
npm run tsc         # TypeScript 类型检查
npm run lint        # Biome 代码检查 + 类型检查
npm run build       # 生产构建
```

### 代理配置（`config/proxy.ts`）

```
/oauth/* → http://127.0.0.1:18080  （网关 → auth 服务）
/system/* → http://127.0.0.1:18080 （网关 → basedata API）
/init/* → http://127.0.0.1:18080  （网关 → basedata API，跳过认证）
```

## 开发要点（编码约定检查清单）

- 所有文本走国际化（`formatMessage`），后端只返回 code，前端翻译
- 所有 ID 使用 `string` 类型（防止前端 int64 精度丢失），请求传 `idStr`
- ProTable `rowKey` 一律用 `"idStr"`
- `useRef<ActionType>(null)` —— React 19 要求必须传 `null` 初始值
- delete 接口统一 `POST` + `{ ids }`
- 新增页面需同步注册路由（`routes.ts`，含 `access` 属性）+ 翻译键（`locales/zh-CN/pages.ts` + `en-US/pages.ts`）
- 新增路由需在 `access.ts` 中添加对应权限判断
- ProLayout 菜单已通过 `/oauth/menus` 动态加载（`app.tsx:getInitialState` 中调用）
- 响应 interceptor 在 `app.tsx` 中全局拆包（`code===200` 时取 `body.data`），新增服务函数无需重复拆包
- 翻译键约定：`pages.*` 页面文本，`entity.*` 实体字段，`status.*` 状态值，`message.*` 操作提示，`app.*` 全局应用文本，`menu.*` 菜单名称
