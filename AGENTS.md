# SaaS-Zero 前端项目指南

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
│   └── routes.ts                  # 前端路由表（含 hierarchy + layout 开关）
├── src/
│   ├── access.ts                  # Casbin 权限映射（isAdmin routeFilter）
│   ├── app.tsx                    # 入口：initialState、layout、request interceptors
│   ├── components/                # 公共可复用组件
│   │   └── SelectLang/            # 语言切换组件
│   ├── locales/                   # 国际化翻译
│   │   ├── zh-CN.ts / en-US.ts    # 合并入口
│   │   ├── zh-CN/                 # 中文翻译包（pages component menu settings ...）
│   │   └── en-US/                 # 英文翻译包
│   ├── pages/
│   │   ├── 404.tsx                # 404 页面
│   │   ├── user/login/            # 登录页（双栏布局，验证码）
│   │   ├── dashboard/             # 控制台
│   │   ├── system/user/           # 用户管理（CRUD + 批量删除 + 重置密码 + 分配角色）
│   │   ├── system/role/           # 角色管理（CRUD + 分配菜单 Tree + 分配 API）
│   │   ├── system/menu/           # 菜单管理（TreeTable CRUD）
│   │   ├── system/dept/           # 部门管理（TreeTable CRUD）
│   │   ├── tenant/list/           # 租户管理（未实现）
│   │   ├── tenant/package/        # 套餐管理（未实现）
│   │   ├── api/                   # API 管理（未实现）
│   │   ├── dict/                  # 字典管理（未实现）
│   │   ├── log/login-log/         # 登录日志（未实现）
│   │   ├── log/operation-log/     # 操作日志（未实现）
│   │   └── init/                  # 系统初始化（未实现）
│   └── services/
│       └── saas-zero/             # API 服务层
│           ├── typings.d.ts       # SaaS 命名空间类型定义（所有实体、请求、响应）
│           ├── index.ts           # 统一导出
│           ├── auth.ts            # 登录/验证码/用户信息/菜单/权限
│           ├── user.ts            # 用户 CRUD + assignRoles + resetPassword
│           ├── role.ts            # 角色 CRUD + assignMenus + assignApis
│           ├── menu.ts            # 菜单 CRUD
│           ├── dept.ts            # 部门 CRUD
│           ├── tenant.ts          # 租户 CRUD
│           ├── package.ts         # 套餐 CRUD
│           ├── api.ts             # API CRUD
│           ├── dict.ts            # 字典 CRUD
│           └── log.ts             # 日志查询
```

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

## 认证流程

### Token 存储
- 使用 `sessionStorage`（`'saas-zero-token'` 键）
- 登录成功时由登录页写入，退出时删除
- 注意：不是 `localStorage`，关闭浏览器标签页即失效

### 请求拦截器（`app.tsx`）
1. **request interceptor**: 从 `sessionStorage` 读取 token，注入 `Authorization: Bearer <token>` 请求头
2. **response interceptor**: 检查 `response.data.code`（Axios 响应结构）→ `code===0` 透传；`!==0` 抛错
3. **error handler**: `code===401 || code===1004` 清除 token 并跳转到登录页

### 初始化数据流
```
app.tsx → getInitialState()
  ├── fetchUserInfo() → GET /oauth/userinfo → currentUser
  └── settings ← defaultSettings
       ↓
initialState 注入 ProLayout → 用户头像/菜单/权限生效
```

### 登录页（`pages/user/login/`）
```
POST /oauth/login { tenantCode, username, password, captchaId, captchaVal }
  → result.token → 存入 sessionStorage
  → result.user → setInitialState({ currentUser })
  → 302 跳转首页
```

## API 请求约定

### 统一响应格式（后端强制）

```json
{
  "code": 0,
  "msg": "success",
  "data": { ... }
}
```

`@umijs/max` 内部使用 **Axios**（`app.tsx` 的 responseInterceptors 接收 `AxiosResponse` 对象，`response.data` 才是 JSON body）。框架默认 `resolve(res.data)` 返回 JSON body `{ code, msg, data }`，**不自动拆包**。

拦截器只负责：`code!==0` 时抛错（errorThrower 不处理 code 字段），`code===1004` 时清 token 跳登录。

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
`getCaptcha` 在 `auth.ts` 中手动拆包（框架返回 `{ code, msg, data }`，需提取 `data` 字段）：

```ts
export async function getCaptcha() {
  const res: any = await request('/oauth/code', { method: 'GET' });
  if (res && res.code !== undefined && res.data) {
    return res.data as SaaS.CaptchaResult;
  }
  return res as SaaS.CaptchaResult;
}
```

其他服务函数同理需从 `{ code, msg, data }` 结构取 data，或让全局 responseInterceptors 统一拆包。

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

### 修改密码

用户头像下拉菜单中的「修改密码」选项会弹出 Modal，包含：
- 当前密码
- 新密码（最少 6 位）
- 确认新密码（前端校验一致性）

调用 `POST /oauth/password/change`（`auth.ts:changePassword`）。

## 授权模型（`access.ts`）

基于 `initialState.currentUser` 的 `roleCodes` 和 `permissions`。`getInitialState` 中会同时调用 `/oauth/permissions` 获取当前用户的权限标识列表。

| 方法 | 逻辑 | 用途 |
|---|---|---|
| `isAdmin` | `roleCodes.includes('admin')` | 管理员专属功能 |
| `canAdmin` | `admin` 或 `manager` | 管理后台操作 |
| `routeFilter` | `hasPermission('menu:xxx')` 或 `isAdmin` | 菜单/路由过滤 |
| `canManageUsers` | `isAdmin` 或 `hasPermission('system:user:manage')` | 用户管理页面 |
| `canManageRoles` | `isAdmin` 或 `hasPermission('system:role:manage')` | 角色管理页面 |
| `canManageMenus` | `isAdmin` 或 `hasPermission('system:menu:manage')` | 菜单管理页面 |
| `canManageDepts` | `isAdmin` 或 `hasPermission('system:dept:manage')` | 部门管理页面 |
| `canManageTenants` | `isAdmin` 或 `hasPermission('system:tenant:manage')` | 租户管理页面 |
| `canManagePackages` | `isAdmin` 或 `hasPermission('system:package:manage')` | 套餐管理页面 |
| `canManageApis` | `isAdmin` 或 `hasPermission('system:api:manage')` | API管理页面 |
| `canManageDicts` | `isAdmin` 或 `hasPermission('system:dict:manage')` | 字典管理页面 |
| `canViewLogs` | `isAdmin` 或 `hasPermission('system:log:view')` | 日志查看页面 |

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
  rowKey="id"
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

## 页面完成状态

| 页面 | 状态 | 核心功能 |
|---|---|---|
| 登录 | ✅ | 双栏布局 + 验证码 + JWT 登录 |
| 控制台 | ✅ | 真实数据统计卡片（用户/租户/角色/登录数） + 最近操作日志 + 系统状态 |
| 用户管理 | ✅ | CRUD ProTable + 批量删除 + 重置密码 + 分配角色 + TreeSelect 部门选择 |
| 角色管理 | ✅ | CRUD ProTable + 分配菜单 Tree + 分配 API 复选框 |
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
| 权限控制 | ✅ | access.ts + routes access 属性 + permissions API |
| 多标签页 | ✅ | PageTabs + 右键菜单（关闭其他/右侧/全部/当前） |
| 国际化 | ✅ | 所有文本走 i18n（zh-CN + en-US），无硬编码中文 |

## 开发要点

- 所有文本走国际化（`formatMessage`），后端只返回 code，前端翻译
- 所有 ID 使用 `string` 类型（防止前端 int64 精度丢失）
- `useRef<ActionType>(null)` —— React 19 要求必须传 `null` 初始值
- delete 接口统一 `POST` + `{ ids }`
- 新增页面需同步注册路由（`routes.ts`，含 `access` 属性）+ 翻译键（`locales/zh-CN/pages.ts` + `en-US/pages.ts`）
- 新增路由需在 `access.ts` 中添加对应权限判断
- ProLayout 菜单已通过 `/oauth/menus` 动态加载（`app.tsx:getInitialState` 中调用）
- 响应 interceptor 在 `app.tsx` 中全局拆包（`code===200` 时取 `body.data`），新增服务函数无需重复拆包
- 翻译键约定：`pages.*` 页面文本，`entity.*` 实体字段，`status.*` 状态值，`message.*` 操作提示，`app.*` 全局应用文本，`menu.*` 菜单名称
