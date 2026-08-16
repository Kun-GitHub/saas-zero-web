import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Tag } from 'antd';
import React, { useRef } from 'react';
import { getLoginLogList } from '@/services/saas-zero/log';
import { formatDateTime } from '@/utils/datetime';

const LoginLogList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<any>[] = [
    { title: f('entity.username'), dataIndex: 'username', width: 120 },
    {
      title: f('entity.log.ip'),
      dataIndex: 'loginIp',
      width: 140,
      search: {
        transform: (value: any) => ({ ip: value }),
      },
    },
    {
      title: f('entity.status'),
      dataIndex: 'status',
      width: 80,
      render: (_, r) => (
        <Tag color={r.status === 'success' ? 'green' : 'red'}>
          {f(`status.${r.status}`)}
        </Tag>
      ),
    },
    {
      title: f('entity.log.message'),
      dataIndex: 'msg',
      width: 200,
      hideInSearch: true,
    },
    {
      title: f('entity.log.time'),
      dataIndex: 'loginAt',
      width: 170,
      hideInSearch: true,
      renderText: (value) => formatDateTime(value),
    },
  ];

  return (
    <ProTable
      rowKey="idStr"
      actionRef={actionRef}
      columns={columns}
      request={async (params) => {
        const res = await getLoginLogList({
          page: params.current || 1,
          pageSize: params.pageSize || 10,
          username: params.username,
          status: params.status,
          ip: params.ip,
        });
        return { data: res.list, success: true, total: res.total };
      }}
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
};

export default LoginLogList;
