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
    routes: [
      {
        path: '/system/user',
        name: 'systemUser',
        icon: 'UserOutlined',
        component: './system/user',
      },
      {
        path: '/system/role',
        name: 'systemRole',
        icon: 'SafetyCertificateOutlined',
        component: './system/role',
      },
      {
        path: '/system/menu',
        name: 'systemMenu',
        icon: 'MenuOutlined',
        component: './system/menu',
      },
      {
        path: '/system/dept',
        name: 'systemDept',
        icon: 'BankOutlined',
        component: './system/dept',
      },
    ],
  },
  {
    path: '/tenant',
    name: 'tenant',
    icon: 'BuildingOutlined',
    routes: [
      {
        path: '/tenant',
        redirect: '/tenant/list',
      },
      {
        path: '/tenant/list',
        name: 'tenantList',
        icon: 'TeamOutlined',
        component: './tenant/list',
      },
      {
        path: '/tenant/package',
        name: 'tenantPackage',
        icon: 'GiftOutlined',
        component: './tenant/package',
      },
    ],
  },
  {
    path: '/api',
    name: 'api',
    icon: 'CodeOutlined',
    component: './api',
  },
  {
    path: '/dict',
    name: 'dict',
    icon: 'BookOutlined',
    component: './dict',
  },
  {
    path: '/log',
    name: 'log',
    icon: 'FileTextOutlined',
    routes: [
      {
        path: '/log',
        redirect: '/log/login-log',
      },
      {
        path: '/log/login-log',
        name: 'loginLog',
        icon: 'LoginOutlined',
        component: './log/login-log',
      },
      {
        path: '/log/operation-log',
        name: 'operationLog',
        icon: 'SwapRightOutlined',
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
