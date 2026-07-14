export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'PieChartOutlined',
    component: './dashboard',
  },
  {
    path: '/system',
    name: 'system',
    icon: 'ApartmentOutlined',
    access: 'canAdmin',
    routes: [
      {
        path: '/system/user',
        name: 'systemUser',
        icon: 'UserOutlined',
        access: 'canManageUsers',
        component: './system/user',
      },
      {
        path: '/system/role',
        name: 'systemRole',
        icon: 'SafetyCertificateOutlined',
        access: 'canManageRoles',
        component: './system/role',
      },
      {
        path: '/system/menu',
        name: 'systemMenu',
        icon: 'MenuOutlined',
        access: 'canManageMenus',
        component: './system/menu',
      },
      {
        path: '/system/dept',
        name: 'systemDept',
        icon: 'BankOutlined',
        access: 'canManageDepts',
        component: './system/dept',
      },
    ],
  },
  {
    path: '/tenant',
    name: 'tenant',
    icon: 'BuildingOutlined',
    access: 'canManageTenants',
    routes: [
      {
        path: '/tenant',
        redirect: '/tenant/list',
      },
      {
        path: '/tenant/list',
        name: 'tenantList',
        icon: 'TeamOutlined',
        access: 'canManageTenants',
        component: './tenant/list',
      },
      {
        path: '/tenant/package',
        name: 'tenantPackage',
        icon: 'GiftOutlined',
        access: 'canManagePackages',
        component: './tenant/package',
      },
    ],
  },
  {
    path: '/api',
    name: 'api',
    icon: 'CodeOutlined',
    access: 'canManageApis',
    component: './api',
  },
  {
    path: '/dict',
    name: 'dict',
    icon: 'BookOutlined',
    access: 'canManageDicts',
    component: './dict',
  },
  {
    path: '/log',
    name: 'log',
    icon: 'FileTextOutlined',
    access: 'canViewLogs',
    routes: [
      {
        path: '/log',
        redirect: '/log/login-log',
      },
      {
        path: '/log/login-log',
        name: 'loginLog',
        icon: 'LoginOutlined',
        access: 'canViewLogs',
        component: './log/login-log',
      },
      {
        path: '/log/operation-log',
        name: 'operationLog',
        icon: 'SwapRightOutlined',
        access: 'canViewLogs',
        component: './log/operation-log',
      },
    ],
  },
  {
    path: '/init',
    name: 'init',
    icon: 'SettingOutlined',
    hideInMenu: true,
    component: './init',
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    component: '404',
  },
];
