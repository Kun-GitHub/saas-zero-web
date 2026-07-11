import { request, useIntl } from '@umijs/max';
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
    try {
      // 调用 /init/all 一次性创建所有初始数据 + Casbin 策略
      const resp: any = await request('/init/all', { method: 'POST' });
      if (resp && resp.code !== 0) throw new Error(resp.msg || 'fail');
      setCurrent(3);
      message.success(f('pages.init.success'));
    } catch (e: any) {
      message.error(e?.message || f('pages.init.stepFailed').replace('{step}', '1'));
    }
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