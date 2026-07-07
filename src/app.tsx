import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { App, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import React, { useCallback } from 'react';
import { SelectLang } from '@/components';
import { getCurrentUser, getMenus } from '@/services/saas-zero/auth';
import defaultSettings from '../config/defaultSettings';

const isDev = process.env.NODE_ENV === 'development' || process.env.CI;
const loginPath = '/user/login';

const useStyles = createStyles(({ token }) => ({
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${token.colorPrimary}, #6366f1)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 14,
  },
  userInfo: {
    lineHeight: 1.2,
    textAlign: 'left' as const,
  },
  userName: {
    fontSize: 14,
    fontWeight: 500,
    color: token.colorText,
  },
  userRole: {
    fontSize: 12,
    color: token.colorTextSecondary,
  },
}));

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: SaaS.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<SaaS.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUser();
      return user;
    } catch {
      return undefined;
    }
  };
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

const AvatarContent: React.FC<{ currentUser?: SaaS.CurrentUser }> = ({ currentUser }) => {
  const { styles } = useStyles();
  const { message } = App.useApp();

  const onLogout = useCallback(() => {
    localStorage.removeItem('saas-zero-token');
    message.success('已退出登录');
    history.push(loginPath);
  }, [message]);

  if (!currentUser) return null;

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: onLogout,
          },
        ],
      }}
    >
      <div className={styles.userContainer}>
        <div className={styles.userAvatar}>
          <UserOutlined />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{currentUser.nickname || currentUser.userName}</div>
          <div className={styles.userRole}>
            {(currentUser as any).roleNames?.join(', ') || '超级管理员'}
          </div>
        </div>
      </div>
    </Dropdown>
  );
};

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<SelectLang key="SelectLang" />],
    avatarProps: false as any,
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
    },
    footerRender: false,
    onPageChange: () => {
      const { location } = history;
      if (!initialState?.currentUser && location.pathname !== loginPath && !location.pathname.startsWith('/init')) {
        history.push(loginPath);
      }
    },
    links: [],
    menuHeaderRender: undefined,
    rightContentRender: () => <AvatarContent currentUser={initialState?.currentUser} />,
    childrenRender: (children) => {
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  baseURL: '',
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('saas-zero-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      return response;
    },
  ],
  errorConfig: {
    errorHandler: (error: any) => {
      const { response } = error;
      if (response && response.status === 401) {
        localStorage.removeItem('saas-zero-token');
        history.push(loginPath);
      }
      return Promise.reject(error);
    },
  },
};
