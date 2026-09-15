import { ClearOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl, useSearchParams } from '@umijs/max';
import { App, Button, InputNumber, Modal, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { useSystemDict } from '@/hooks/useSystemDict';
import { cleanJobLog, getJobLogList } from '@/services/saas-zero/job';
import { formatDateTime } from '@/utils/datetime';
import { usePermission } from '@/utils/permission';

const logStatusColor: Record<string, string> = {
  success: 'green',
  fail: 'red',
  timeout: 'orange',
  skipped: 'default',
};

const JobLogList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();
  const { can } = usePermission();
  const statusDict = useSystemDict('job_exec_status');
  const triggerDict = useSystemDict('trigger_type');
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || undefined;
  const jobName = searchParams.get('jobName') || undefined;
  const [cleanOpen, setCleanOpen] = useState(false);
  const [keepDays, setKeepDays] = useState<number>(30);

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<SaaS.SysJobLog>[] = [
    { title: f('pages.job.name'), dataIndex: 'jobName', width: 140 },
    {
      title: f('pages.job.log.jobId'),
      dataIndex: 'jobId',
      width: 180,
      hideInSearch: true,
    },
    {
      title: f('pages.job.log.triggerType'),
      dataIndex: 'triggerType',
      width: 100,
      hideInSearch: true,
      render: (_, r) => (
        <Tag color={r.triggerType === 'cron' ? 'blue' : 'purple'}>
          {triggerDict.getLabel(r.triggerType)}
        </Tag>
      ),
    },
    {
      title: f('pages.job.status'),
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        statusDict.options.map((option) => [
          option.value,
          { text: option.label },
        ]),
      ),
      render: (_, r) => (
        <Tag color={logStatusColor[r.status]}>
          {statusDict.getLabel(r.status)}
        </Tag>
      ),
    },
    {
      title: f('pages.job.log.attempt'),
      dataIndex: 'attempt',
      width: 70,
      hideInSearch: true,
    },
    {
      title: f('pages.job.log.duration'),
      dataIndex: 'duration',
      width: 90,
      hideInSearch: true,
      renderText: (value) => (value ? `${value} ms` : '-'),
    },
    {
      title: f('pages.job.log.execNode'),
      dataIndex: 'execNode',
      width: 100,
      hideInSearch: true,
      render: (_, r) => (r.execNode ? <Tag>{r.execNode}</Tag> : '-'),
    },
    {
      title: f('pages.job.log.message'),
      dataIndex: 'message',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: f('pages.job.log.exceptionInfo'),
      dataIndex: 'exceptionInfo',
      width: 200,
      ellipsis: true,
      hideInSearch: true,
      render: (_, r) =>
        r.exceptionInfo ? <ModalText text={r.exceptionInfo} /> : '-',
    },
    {
      title: f('entity.createdAt'),
      dataIndex: 'createdAt',
      width: 170,
      hideInSearch: true,
      renderText: (value) => formatDateTime(value),
    },
  ];

  return (
    <>
      <ProTable
        rowKey="idStr"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const res = await getJobLogList({
            page: params.current || 1,
            pageSize: params.pageSize || 10,
            jobId: params.jobId || jobId,
            jobName: params.jobName || jobName,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        toolBarRender={() => [
          can('system:job:log') && (
            <Button
              key="clean"
              icon={<ClearOutlined />}
              onClick={() => setCleanOpen(true)}
            >
              {f('pages.job.log.clean')}
            </Button>
          ),
        ]}
        search={{ labelWidth: 'auto' }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) =>
            f('entity.totalRecords').replace('{total}', String(total)),
        }}
      />
      <Modal
        title={f('pages.job.log.clean')}
        open={cleanOpen}
        onOk={async () => {
          const targetId = jobId;
          if (!targetId) {
            message.warning(f('pages.job.log.cleanNoJob'));
            return;
          }
          await cleanJobLog({ jobId: targetId, keepDays });
          message.success(f('message.operationSuccess'));
          setCleanOpen(false);
          actionRef.current?.reload();
        }}
        onCancel={() => setCleanOpen(false)}
      >
        <div>
          {f('pages.job.log.cleanConfirm')}
          <InputNumber
            min={1}
            max={3650}
            value={keepDays}
            onChange={(v) => setKeepDays(v as number)}
            style={{ width: 120, margin: '0 8px' }}
          />
          {f('pages.job.log.cleanDays')}
        </div>
      </Modal>
    </>
  );
};

// 异常信息可能较长，点击查看完整内容
const ModalText: React.FC<{ text: string }> = ({ text }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="link" size="small" onClick={() => setOpen(true)}>
        {intl.formatMessage({ id: 'pages.job.log.viewDetail' })}
      </Button>
      <Modal
        title={intl.formatMessage({ id: 'pages.job.log.exceptionInfo' })}
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {text}
        </pre>
      </Modal>
    </>
  );
};

export default JobLogList;
