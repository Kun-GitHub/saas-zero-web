import {
  BuildOutlined,
  LockOutlined,
  RedoOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { getCaptcha, login } from '@/services/saas-zero/auth';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => ({
  lang: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '0 0 55%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #4f46e5 100%)',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      top: -80,
      right: -80,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.03)',
      bottom: -40,
      left: -40,
    },
  },
  brand: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 32px',
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    fontSize: 36,
  },
  systemName: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  systemDesc: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 1.7,
  },
  rightPanel: {
    flex: '0 0 45%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc',
    overflow: 'hidden',
  },
  formCard: {
    width: '100%',
    maxWidth: 520,
    padding: '0 24px',
    overflow: 'hidden',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  },
  captchaRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  captchaInput: {
    flex: 1,
  },
  captchaImgBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  captchaImg: {
    height: 40,
    width: 110,
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    display: 'block',
    objectFit: 'contain',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    color: token.colorPrimary,
    fontSize: 12,
    background: 'none',
    border: 'none',
    padding: 0,
    lineHeight: 1,
  },
}));

const Login: React.FC = () => {
  const { styles } = useStyles();
  const { setInitialState } = useModel('@@initialState');
  const { message } = App.useApp();
  const intl = useIntl();
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');
  const [loading, setLoading] = useState(false);

  const f = (id: string) => intl.formatMessage({ id });

  const loadCaptcha = async () => {
    try {
      const res = await getCaptcha();
      setCaptchaId(res.captchaId);
      setCaptchaImg(res.captchaImg);
    } catch {
      setCaptchaId('');
      setCaptchaImg('');
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!captchaId) {
      message.error(f('pages.login.failure'));
      return;
    }
    setLoading(true);
    try {
      const result = await login({
        tenantCode: values.tenantCode,
        username: values.username,
        password: values.password,
        captchaId,
        captchaVal: values.captcha,
      });
      localStorage.setItem('saas-zero-token', result.token);
      const userInfo = await result.user;
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get('redirect') || '/';
    } catch (e: any) {
      message.error(e?.message || f('pages.login.failure'));
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{f('menu.login')} - {Settings.title}</title>
      </Helmet>
      <div className={styles.lang}>
        <SelectLang />
      </div>
      <div className={styles.leftPanel}>
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <BuildOutlined />
          </div>
          <div className={styles.systemName}>SaaS-Zero</div>
          <div className={styles.systemDesc}>
            {f('pages.login.subtitle')}
          </div>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formTitle}>{f('pages.login.submit')}</div>
          <div className={styles.formSubtitle}>{f('pages.login.subtitle')}</div>
          <LoginForm
            logo={false}
            title={false}
            subTitle={false}
            initialValues={{ tenantCode: 'default', username: 'admin', password: '123456', autoLogin: true }}
            onFinish={handleSubmit}
            submitter={{
              searchConfig: { submitText: f('pages.login.submit') },
              submitButtonProps: { loading, block: true, size: 'large' },
            }}
          >
            <ProFormText
              name="tenantCode"
              fieldProps={{
                size: 'large',
                prefix: <BuildOutlined style={{ color: '#94a3b8' }} />,
                placeholder: f('pages.login.tenantCode.placeholder'),
              }}
              rules={[{ required: true, message: f('pages.login.tenantCode.required') }]}
            />
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined style={{ color: '#94a3b8' }} />,
                placeholder: f('pages.login.username.placeholder'),
              }}
              rules={[{ required: true, message: f('pages.login.username.required') }]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined style={{ color: '#94a3b8' }} />,
                placeholder: f('pages.login.password.placeholder'),
              }}
              rules={[{ required: true, message: f('pages.login.password.required') }]}
            />
            <div className={styles.captchaRow}>
              <div className={styles.captchaInput}>
                <ProFormText
                  name="captcha"
                  fieldProps={{
                    size: 'large',
                    prefix: <SafetyCertificateOutlined style={{ color: '#94a3b8' }} />,
                    placeholder: f('pages.login.captcha.placeholder'),
                  }}
                  rules={[{ required: true, message: f('pages.login.captcha.required') }]}
                />
              </div>
              <div className={styles.captchaImgBox}>
                {captchaImg ? (
                  <img
                    className={styles.captchaImg}
                    src={captchaImg}
                    alt="captcha"
                    onClick={loadCaptcha}
                  />
                ) : (
                  <img
                    className={styles.captchaImg}
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Crect width='100' height='40' fill='%23f1f5f9' rx='4'/%3E%3Ctext x='50' y='26' text-anchor='middle' fill='%2394a3b8' font-size='12'%3Eloading%3C/text%3E%3C/svg%3E"
                    alt="loading"
                  />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ProFormCheckbox name="autoLogin">
                {f('pages.login.rememberMe')}
              </ProFormCheckbox>
            </div>
          </LoginForm>
        </div>
      </div>
    </div>
  );
};

export default Login;
