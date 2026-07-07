import type { ProLayoutProps } from '@ant-design/pro-components';

const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#2563eb',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'SaaS-Zero',
  pwa: false,
  logo: '/logo.svg',
  iconfontUrl: '',
  token: {
    header: {
      colorBgHeader: '#fff',
      colorHeaderTitle: '#1e293b',
      heightLayoutHeader: 64,
    },
    sider: {
      colorBgMenuItemSelected: '#eff6ff',
      colorMenuItemDivider: '#f1f5f9',
    },
  },
};

export default Settings;
