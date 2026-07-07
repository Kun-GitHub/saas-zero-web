import { useIntl } from '@umijs/max';
import { App, Button, Card, Space, Steps } from 'antd';
import React, { useState } from 'react';

const InitPage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const f = (id: string) => intl.formatMessage({ id });
  const [current, setCurrent] = useState(-1);
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: f('pages.init.step1') },
    { title: f('pages.init.step2') },
    { title: f('pages.init.step3') },
    { title: f('pages.init.step4') },
  ];

  const runInit = async () => {
    setLoading(true);
    const apis = ['/init/package/create', '/init/tenant/create', '/init/role/create', '/init/user/create'];
    for (let i = 0; i < apis.length; i++) {
      try {
        const resp = await fetch(apis[i], { method: 'POST' });
        if (!resp.ok) throw new Error('fail');
        setCurrent(i);
      } catch {
        message.error(f('pages.init.stepFailed').replace('{step}', String(i + 1)));
        setLoading(false);
        return;
      }
    }
    message.success(f('pages.init.success'));
    setLoading(false);
  };

  return (
    <Card title={f('pages.init.title')}>
      <Steps current={current} items={steps} style={{ marginBottom: 32 }} />
      <Space>
        <Button type="primary" size="large" loading={loading} onClick={runInit}>{f('pages.init.runAll')}</Button>
      </Space>
    </Card>
  );
};

export default InitPage;