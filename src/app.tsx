import { KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, useIntl } from '@umijs/max';
import { message as antdMessage, Dropdown } from 'antd';
import React from 'react';
import { SelectLang } from '@/components';
import PageTabs from '@/components/PageTabs';
import {
  getCurrentUser,
  getMenus,
  getPermissions,
} from '@/services/saas-zero/auth';
import { buildLayoutMenu } from '@/utils/menu';
import defaultSettings from '../config/defaultSettings';

const isDev = process.env.NODE_ENV === 'development' || process.env.CI;
const loginPath = '/user/login';

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: SaaS.CurrentUser;
  menuData?: any[];
  loading?: boolean;
  fetchUserInfo?: () => Promise<SaaS.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUser();
      user.tenantCode = sessionStorage.getItem('saas-zero-tenant') || undefined;
      // Fetch permissions and merge into currentUser
      try {
        const perms = await getPermissions();
        if (perms) {
          user.permissions = perms;
        }
      } catch {
        // permissions fetch failed, continue with empty permissions
      }
      return user;
    } catch (e: any) {
      if (e?.code === 1004) {
        sessionStorage.removeItem('saas-zero-token');
      }
      return undefined;
    }
  };
  const { location } = history;
  if (location.pathname !== loginPath) {
    const [currentUser, apiMenus] = await Promise.all([
      fetchUserInfo(),
      getMenus().catch(() => undefined),
    ]);
    return {
      fetchUserInfo,
      currentUser,
      menuData: buildLayoutMenu(apiMenus),
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

const AvatarDropdown: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const intl = useIntl();
  const f = (id: string) => intl.formatMessage({ id });
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: f('app.profile'),
            onClick: () => history.push('/account/center'),
          },
          {
            key: 'changePassword',
            icon: <KeyOutlined />,
            label: f('app.changePassword'),
            onClick: () =>
              history.push('/account/center?action=changePassword'),
          },
          { type: 'divider' as const },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: f('app.logout'),
            onClick: () => {
              sessionStorage.removeItem('saas-zero-token');
              history.push(loginPath);
            },
          },
        ],
      }}
    >
      {children}
    </Dropdown>
  );
};

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  const currentUser = initialState?.currentUser;
  return {
    actionsRender: () => [<SelectLang key="SelectLang" />],
    avatarProps: currentUser
      ? {
          title: currentUser.nickname || currentUser.userName,
          render: (_: any, defaultDom: React.ReactNode) => (
            <AvatarDropdown>{defaultDom}</AvatarDropdown>
          ),
        }
      : undefined,
    waterMarkProps: {
      content: currentUser?.userName,
    },
    footerRender: false,
    onPageChange: () => {
      const { location } = history;
      if (
        !initialState?.currentUser &&
        location.pathname !== loginPath &&
        !location.pathname.startsWith('/init')
      ) {
        history.push(loginPath);
      }
    },
    menuDataRender: initialState?.menuData
      ? () => initialState.menuData!
      : undefined,
    links: [],
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      return (
        <PageTabs>
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
        </PageTabs>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  baseURL: '',
  requestInterceptors: [
    (config: any) => {
      const token = sessionStorage.getItem('saas-zero-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(
        `[API] → ${config.method?.toUpperCase()} ${config.url}`,
        config.params || config.data || '',
      );
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      console.log('[API] ←', response);
      // Axios response: { data: body, status, ... }; body = { code, msg, data }
      let body = response?.data;
      // 兼容后端以 text/plain 返回的 JSON 字符串（旧 http.Error 场景）：
      // 统一解析为对象，确保 code 字段能被识别并触发自动登出。
      if (typeof body === 'string' && body.trim().startsWith('{')) {
        try {
          body = JSON.parse(body);
          response = { ...response, data: body };
        } catch {
          // 非 JSON 字符串，保持原样
        }
      }
      if (body && body.code !== undefined) {
        if (body.code !== 200) {
          // token 失效/过期/版本不匹配（401 / 1004）：清除本地 token 并跳转登录页
          if (body.code === 1004 || body.code === 401) {
            console.log('[API] token expired, logging out');
            sessionStorage.removeItem('saas-zero-token');
            setTimeout(() => {
              window.location.hash = '#' + loginPath;
            }, 100);
          }
          const err: any = new Error(body.msg || 'Request failed');
          err.code = body.code;
          throw err;
        }
        // Unwrap: replace response.data with body.data so the caller gets the inner data
        return { ...response, data: body.data };
      }
      return response;
    },
  ],
  errorConfig: {
    errorHandler: (error: any) => {
      console.log(
        '[API] ✗',
        error.code || error.response?.status,
        error.message,
      );
      const code =
        error.code || error.response?.data?.code || error.response?.status;
      if (code === 401 || code === 1004) {
        sessionStorage.removeItem('saas-zero-token');
        setTimeout(() => {
          window.location.hash = '#' + loginPath;
        }, 100);
        return;
      }
      antdMessage.error(error.message || 'Request failed');
    },
  },
};
