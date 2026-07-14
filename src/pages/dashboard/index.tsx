import { useIntl } from '@umijs/max';
import {
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Timeline,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { getLoginLogList, getOperationLogList } from '@/services/saas-zero/log';
import { getRoleList } from '@/services/saas-zero/role';
import { getTenantList } from '@/services/saas-zero/tenant';
import { getUserList } from '@/services/saas-zero/user';

const Dashboard: React.FC = () => {
  const intl = useIntl();
  const f = (id: string) => intl.formatMessage({ id });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userTotal: 0,
    tenantTotal: 0,
    roleTotal: 0,
    loginTotal: 0,
  });
  const [recentLogs, setRecentLogs] = useState<SaaS.SysOperationLog[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [users, tenants, roles, logins, operations] = await Promise.all([
          getUserList({ page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
          getTenantList({ page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
          getRoleList({ page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
          getLoginLogList({ page: 1, pageSize: 1 }).catch(() => ({ total: 0 })),
          getOperationLogList({ page: 1, pageSize: 5 }).catch(() => ({
            list: [],
            total: 0,
          })),
        ]);
        setStats({
          userTotal: (users as any).total || 0,
          tenantTotal: (tenants as any).total || 0,
          roleTotal: (roles as any).total || 0,
          loginTotal: (logins as any).total || 0,
        });
        setRecentLogs((operations as any).list || []);
      } catch {
        // silently fail
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cardColors = ['#3b82f6', '#8b5cf6', '#6366f1', '#10b981'];
  const statKeys = [
    'userTotal',
    'tenantTotal',
    'roleTotal',
    'loginTotal',
  ] as const;
  const statValues = [
    stats.userTotal,
    stats.tenantTotal,
    stats.roleTotal,
    stats.loginTotal,
  ];

  return (
    <div>
      <Row gutter={[24, 24]}>
        {statKeys.map((key, idx) => (
          <Col xs={24} sm={12} lg={6} key={key}>
            <Card hoverable>
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={f(`pages.dashboard.${key}`)}
                  value={statValues[idx]}
                  valueStyle={{ color: cardColors[idx] }}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={f('pages.dashboard.recentLogs')}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : recentLogs.length > 0 ? (
              <Timeline
                items={recentLogs.map((log, idx) => ({
                  color: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ef4444',
                  ][idx % 5],
                  children: (
                    <>
                      <b>{log.operatorName}</b>{' '}
                      <Tag color="blue">{log.module}</Tag>
                      {log.operation}
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {log.createdAt}
                      </div>
                    </>
                  ),
                }))}
              />
            ) : (
              <Empty description={f('message.noData')} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={f('pages.dashboard.systemStatus')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: f('pages.dashboard.stat.api'), color: '#10b981' },
                { label: f('pages.dashboard.stat.database'), color: '#3b82f6' },
                { label: f('pages.dashboard.stat.cache'), color: '#8b5cf6' },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>
                      {f('status.normal')}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: '#f1f5f9',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: '100%',
                        background: item.color,
                        borderRadius: 4,
                      }}
                    />
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
