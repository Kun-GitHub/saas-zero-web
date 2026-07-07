import { useIntl } from '@umijs/max';
import { Card, Col, Row, Skeleton, Statistic, Timeline } from 'antd';
import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const intl = useIntl();

  return (
    <div>
      <Row gutter={[24, 24]}>
        {[
          { key: 'userTotal', value: '1,234', trend: '+12%', trendKey: 'trendUp', color: '#3b82f6' },
          { key: 'tenantTotal', value: '56', trend: '+5%', trendKey: 'trendUp', color: '#8b5cf6' },
          { key: 'roleTotal', value: '23', trend: 'noChange', trendKey: 'noChange', color: '#6366f1' },
          { key: 'todayLogins', value: '89', trend: '-8%', trendKey: 'trendDown', color: '#10b981' },
        ].map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <Card hoverable>
              <Statistic
                title={intl.formatMessage({ id: `pages.dashboard.${card.key}` })}
                value={card.value}
                suffix={
                  <span style={{ fontSize: 12, color: card.trendKey === 'trendUp' ? '#10b981' : card.trendKey === 'trendDown' ? '#ef4444' : '#94a3b8' }}>
                    {card.trendKey === 'noChange' ? intl.formatMessage({ id: 'pages.dashboard.noChange' }) : `${intl.formatMessage({ id: `pages.dashboard.${card.trendKey}` })} ${card.trend}`}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={intl.formatMessage({ id: 'pages.dashboard.recentLogs' })}>
            <Timeline
              items={[
                { color: '#3b82f6', children: <><b>admin</b> 创建了用户 张三<div style={{ fontSize: 12, color: '#94a3b8' }}>2024-01-15 14:30:00</div></> },
                { color: '#10b981', children: <><b>admin</b> 更新了角色 管理员<div style={{ fontSize: 12, color: '#94a3b8' }}>2024-01-15 14:25:00</div></> },
                { color: '#f59e0b', children: <><b>admin</b> 创建了租户 新租户<div style={{ fontSize: 12, color: '#94a3b8' }}>2024-01-15 14:20:00</div></> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={intl.formatMessage({ id: 'pages.dashboard.systemStatus' })}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['API', intl.formatMessage({ id: 'pages.login.subtitle' }), 'Database', 'Redis'].map((label) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{label}</span>
                    <span style={{ color: '#10b981' }}>{intl.formatMessage({ id: 'status.normal' })}</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', background: '#10b981', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;