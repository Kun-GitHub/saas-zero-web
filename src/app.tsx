import * as Icons from '@ant-design/icons';
import { KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, useIntl } from '@umijs/max';
import { App, Dropdown, Form, Input, Modal } from 'antd';
import { createStyles } from 'antd-style';
import React, { useCallback, useState } from 'react';
import { SelectLang } from '@/components';
import PageTabs from '@/components/PageTabs';
import {
  changePassword,
  getCurrentUser,
  getMenus,
  getPermissions,
} from '@/services/saas-zero/auth';
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
  menuData?: any[];
  loading?: boolean;
  fetchUserInfo?: () => Promise<SaaS.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUser();
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
    const menuData =
      apiMenus && apiMenus.length > 0
        ? apiMenus.map((m: any) => apiMenuToLayout(m))
        : undefined;
    return {
      fetchUserInfo,
      currentUser,
      menuData,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

const apiMenuToLayout = (m: any): any => {
  // ProLayout/antd Menu keys items by `path`. Directory nodes with an empty
  // path would all collapse to `undefined`, making sibling directories expand,
  // collapse and highlight together. Guarantee a unique, stable path per node.
  const path = m.path || `/__menu_${m.id}`;
  return {
    key: path,
    name: m.name,
    path,
    icon: m.icon ? resolveIcon(m.icon) : undefined,
    hideInMenu: m.hidden || false,
    children: m.children?.length
      ? m.children.map((c: any) => apiMenuToLayout(c))
      : undefined,
  };
};

const iconCache = new Map<string, React.ReactNode>();
const resolveIcon = (name: string): React.ReactNode => {
  if (iconCache.has(name)) return iconCache.get(name);
  const Comp = (Icons as any)[name + 'Outlined'] || (Icons as any)[name];
  if (!Comp) {
    iconCache.set(name, null);
    return null;
  }
  const node = <Comp />;
  iconCache.set(name, node);
  return node;
};

const AvatarContent: React.FC<{ currentUser?: SaaS.CurrentUser }> = ({
  currentUser,
}) => {
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();
  const f = (id: string) => intl.formatMessage({ id });

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const [pwdLoading, setPwdLoading] = useState(false);

  const onLogout = useCallback(() => {
    sessionStorage.removeItem('saas-zero-token');
    message.success(f('app.logout.success'));
    history.push(loginPath);
  }, [message, f]);

  const handleChangePassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error(f('app.password.mismatch'));
        return;
      }
      setPwdLoading(true);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success(f('app.password.success'));
      setPwdModalOpen(false);
      pwdForm.resetFields();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setPwdLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: f('app.profile'),
              disabled: true,
            },
            {
              key: 'changePassword',
              icon: <KeyOutlined />,
              label: f('app.changePassword'),
              onClick: () => {
                pwdForm.resetFields();
                setPwdModalOpen(true);
              },
            },
            { type: 'divider' },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: f('app.logout'),
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
            <div className={styles.userName}>
              {currentUser.nickname || currentUser.userName}
            </div>
            <div className={styles.userRole}>
              {currentUser.roleCodes?.join(', ') || f('app.defaultRole')}
            </div>
          </div>
        </div>
      </Dropdown>
      <Modal
        title={f('app.changePassword')}
        open={pwdModalOpen}
        onOk={handleChangePassword}
        onCancel={() => setPwdModalOpen(false)}
        confirmLoading={pwdLoading}
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label={f('app.password.old')}
            rules={[{ required: true, message: f('app.password.oldRequired') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={f('app.password.new')}
            rules={[
              { required: true, message: f('app.password.newRequired') },
              { min: 6, message: f('app.password.minLength') },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={f('entity.confirmPassword')}
            rules={[
              { required: true, message: f('app.password.confirmRequired') },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [<SelectLang key="SelectLang" />],
    avatarProps: false as any,
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
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
    rightContentRender: () => (
      <AvatarContent currentUser={initialState?.currentUser} />
    ),
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
      const body = response?.data;
      if (body && body.code !== undefined) {
        if (body.code !== 200) {
          if (body.code === 1004 || body.code === 401) {
            console.log('[API] token expired, logging out');
            sessionStorage.removeItem('saas-zero-token');
            setTimeout(() => {
              window.location.href = loginPath;
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
          window.location.href = loginPath;
        }, 100);
        return;
      }
    },
  },
};
