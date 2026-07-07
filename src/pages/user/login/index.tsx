import {
  BuildOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import { login } from '@/services/saas-zero/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(() => ({
  lang: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    margin: '0 16px',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
}));

const Login: React.FC = () => {
  const { styles } = useStyles();
  const { setInitialState } = useModel('@@initialState');
  const { message } = App.useApp();
  const intl = useIntl();

  const handleSubmit = async (values: any) => {
    try {
      const result = await login({
        tenantCode: values.tenantCode,
        username: values.username,
        password: values.password,
      });
      localStorage.setItem('saas-zero-token', result.token);
      message.success(
        intl.formatMessage({ id: 'pages.login.success', defaultMessage: '登录成功！' }),
      );
      const userInfo = await result.user;
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get('redirect') || '/';
    } catch {
      message.error(
        intl.formatMessage({ id: 'pages.login.failure', defaultMessage: '登录失败，请重试！' }),
      );
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{intl.formatMessage({ id: 'menu.login', defaultMessage: '登录' })} - {Settings.title}</title>
      </Helmet>
      <div className={styles.lang}>
        <SelectLang />
      </div>
      <div className={styles.card}>
        <LoginForm
          logo={false}
          title={
            <div style={{ textAlign: 'center' }}>
              <div className={styles.logo}>
                <BuildOutlined style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>SaaS-Zero 管理平台</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                {intl.formatMessage({ id: 'pages.login.subtitle', defaultMessage: '统一身份认证与权限管理系统' })}
              </div>
            </div>
          }
          subTitle={false}
          initialValues={{ tenantCode: 'default', username: 'admin', password: '123456', autoLogin: true }}
          onFinish={handleSubmit}
          submitter={{
            searchConfig: { submitText: intl.formatMessage({ id: 'pages.login.submit', defaultMessage: '登 录' }) },
          }}
        >
          <ProFormText
            name="tenantCode"
            fieldProps={{
              size: 'large',
              prefix: <BuildOutlined style={{ color: '#94a3b8' }} />,
              placeholder: intl.formatMessage({ id: 'pages.login.tenantCode.placeholder', defaultMessage: '请输入租户编码' }),
            }}
            rules={[{ required: true, message: intl.formatMessage({ id: 'pages.login.tenantCode.required', defaultMessage: '请输入租户编码' }) }]}
          />
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined style={{ color: '#94a3b8' }} />,
              placeholder: intl.formatMessage({ id: 'pages.login.username.placeholder', defaultMessage: '请输入用户名' }),
            }}
            rules={[{ required: true, message: intl.formatMessage({ id: 'pages.login.username.required', defaultMessage: '请输入用户名' }) }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined style={{ color: '#94a3b8' }} />,
              placeholder: intl.formatMessage({ id: 'pages.login.password.placeholder', defaultMessage: '请输入密码' }),
            }}
            rules={[{ required: true, message: intl.formatMessage({ id: 'pages.login.password.required', defaultMessage: '请输入密码' }) }]}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ProFormCheckbox name="autoLogin">
              {intl.formatMessage({ id: 'pages.login.rememberMe', defaultMessage: '记住我' })}
            </ProFormCheckbox>
            <a style={{ fontSize: 13, color: '#2563eb' }}>
              {intl.formatMessage({ id: 'pages.login.forgotPassword', defaultMessage: '忘记密码?' })}
            </a>
          </div>
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
