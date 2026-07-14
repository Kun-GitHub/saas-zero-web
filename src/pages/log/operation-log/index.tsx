import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Tag } from 'antd';
import React, { useRef } from 'react';
import { getOperationLogList } from '@/services/saas-zero/log';

const OperationLogList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<any>[] = [
    { title: f('entity.log.operator'), dataIndex: 'operatorName', width: 100 },
    { title: f('entity.log.module'), dataIndex: 'module', width: 120 },
    { title: f('entity.log.action'), dataIndex: 'operation', width: 120 },
    {
      title: f('entity.log.path'),
      dataIndex: 'requestUrl',
      width: 260,
      hideInSearch: true,
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
      title: f('entity.log.duration'),
      dataIndex: 'duration',
      width: 90,
      hideInSearch: true,
    },
    {
      title: f('entity.log.time'),
      dataIndex: 'createdAt',
      width: 170,
      hideInSearch: true,
    },
  ];

  return (
    <ProTable
      rowKey="id"
      actionRef={actionRef}
      columns={columns}
      request={async (params) => {
        const res = await getOperationLogList({
          page: params.current || 1,
          pageSize: params.pageSize || 10,
          module: params.module,
          operation: params.operation,
          operatorName: params.operatorName,
        });
        return { data: res.list, success: true, total: res.total };
      }}
      search={{ labelWidth: 'auto' }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
};

export default OperationLogList;
