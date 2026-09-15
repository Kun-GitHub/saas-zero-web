import {
  CaretRightOutlined,
  DeleteOutlined,
  PauseOutlined,
  PlusOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useSystemDict } from '@/hooks/useSystemDict';
import {
  createJob,
  deleteJob,
  getJobHandlers,
  getJobList,
  pauseJob,
  runJobOnce,
  startJob,
  updateJob,
} from '@/services/saas-zero/job';
import { formatDateTime } from '@/utils/datetime';
import { usePermission } from '@/utils/permission';

const { Text } = Typography;

const statusColor: Record<string, string> = {
  active: 'green',
  inactive: 'red',
  suspended: 'orange',
};

const execStatusColor: Record<string, string> = {
  success: 'green',
  fail: 'red',
  timeout: 'orange',
  skipped: 'default',
  none: 'default',
};

const JobList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const { can } = usePermission();
  const statusDict = useSystemDict('status', ['active', 'inactive']);
  const groupDict = useSystemDict('job_group');
  const misfireDict = useSystemDict('misfire_policy');
  const execStatusDict = useSystemDict('job_exec_status');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SaaS.SysJob | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [handlerOptions, setHandlerOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    getJobHandlers()
      .then((list) =>
        setHandlerOptions(
          (list || []).map((h) => ({ value: h.code, label: h.name || h.code })),
        ),
      )
      .catch(() => setHandlerOptions([]));
  }, []);

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<SaaS.SysJob>[] = [
    { title: f('pages.job.name'), dataIndex: 'name', width: 160 },
    {
      title: f('pages.job.group'),
      dataIndex: 'group',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        groupDict.options.map((option) => [
          option.value,
          { text: option.label },
        ]),
      ),
      render: (_, r) => <Tag color="blue">{groupDict.getLabel(r.group)}</Tag>,
    },
    {
      title: f('pages.job.handler'),
      dataIndex: 'handler',
      width: 130,
    },
    {
      title: f('pages.job.cron'),
      dataIndex: 'cronExpression',
      width: 130,
      ellipsis: true,
      hideInSearch: true,
      render: (_, r) => <Text code>{r.cronExpression}</Text>,
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
        <Tag color={statusColor[r.status]}>{statusDict.getLabel(r.status)}</Tag>
      ),
    },
    {
      title: f('pages.job.nextRunAt'),
      dataIndex: 'nextRunAt',
      width: 160,
      hideInSearch: true,
      renderText: (value) => formatDateTime(value),
    },
    {
      title: f('pages.job.lastStatus'),
      dataIndex: 'lastStatus',
      width: 90,
      hideInSearch: true,
      render: (_, r) => (
        <Tag color={execStatusColor[r.lastStatus]}>
          {execStatusDict.getLabel(r.lastStatus)}
        </Tag>
      ),
    },
    {
      title: f('pages.job.lastRunAt'),
      dataIndex: 'lastRunAt',
      width: 160,
      hideInSearch: true,
      renderText: (value) => formatDateTime(value),
    },
    {
      title: f('pages.job.lastError'),
      dataIndex: 'lastError',
      width: 160,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: f('entity.action'),
      width: 300,
      fixed: 'right',
      hideInSearch: true,
      render: (_, r) => (
        <Space size={0} wrap>
          {r.status !== 'active' && can('system:job:start') && (
            <Button
              type="link"
              size="small"
              icon={<CaretRightOutlined />}
              onClick={async () => {
                await startJob(r.idStr!);
                message.success(f('pages.job.started'));
                actionRef.current?.reload();
              }}
            >
              {f('pages.job.start')}
            </Button>
          )}
          {r.status === 'active' && can('system:job:pause') && (
            <Button
              type="link"
              size="small"
              icon={<PauseOutlined />}
              onClick={async () => {
                await pauseJob(r.idStr!);
                message.success(f('pages.job.paused'));
                actionRef.current?.reload();
              }}
            >
              {f('pages.job.pause')}
            </Button>
          )}
          {can('system:job:run') && (
            <Button
              type="link"
              size="small"
              icon={<RedoOutlined />}
              onClick={() => {
                modal.confirm({
                  title: f('pages.job.runOnceConfirm'),
                  onOk: async () => {
                    await runJobOnce(r.idStr!);
                    message.success(f('pages.job.running'));
                    actionRef.current?.reload();
                  },
                });
              }}
            >
              {f('pages.job.runOnce')}
            </Button>
          )}
          {can('system:job:update') && (
            <Button type="link" size="small" onClick={() => openEditModal(r)}>
              {f('entity.edit')}
            </Button>
          )}
          {can('system:job:delete') && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                modal.confirm({
                  title: f('pages.job.deleteConfirm'),
                  onOk: async () => {
                    await deleteJob([r.idStr!]);
                    message.success(f('message.deleteSuccess'));
                    actionRef.current?.reload();
                  },
                });
              }}
            >
              {f('entity.delete')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const openEditModal = (job: SaaS.SysJob) => {
    setEditRecord(job);
    form.resetFields();
    form.setFieldsValue({
      ...job,
      group: job.group || 'default',
      misfirePolicy: job.misfirePolicy || 'fire_once',
      concurrent: job.concurrent,
      timeout: job.timeout,
      maxRetry: job.maxRetry,
      retryInterval: job.retryInterval,
      status: job.status || 'active',
    });
    setModalOpen(true);
  };

  const handleBatchDelete = () => {
    modal.confirm({
      title: f('pages.job.batchDeleteConfirm'),
      content: f('pages.job.batchDeleteContent').replace(
        '{count}',
        String(selectedRowKeys.length),
      ),
      onOk: async () => {
        await deleteJob(selectedRowKeys as string[]);
        message.success(f('message.deleteSuccess'));
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  return (
    <>
      <ProTable<SaaS.SysJob>
        rowKey="idStr"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const res = await getJobList({
            page: params.current || 1,
            pageSize: params.pageSize || 10,
            name: params.name,
            group: params.group,
            handler: params.handler,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        scroll={{ x: 1300 }}
        toolBarRender={() => [
          can('system:job:delete') && selectedRowKeys.length > 0 && (
            <Button
              key="batchDelete"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              {f('pages.job.batchDelete')}
            </Button>
          ),
          can('system:job:create') && (
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditRecord(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              {f('pages.job.create')}
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
        title={f(editRecord ? 'pages.job.edit' : 'pages.job.create')}
        open={modalOpen}
        width={640}
        onOk={async () => {
          const values = await form.validateFields();
          const payload: SaaS.JobUpdate = {
            ...values,
            params: values.params || '',
            remark: values.remark || '',
          };
          if (editRecord) {
            await updateJob({ ...payload, id: editRecord.idStr! });
          } else {
            await createJob(payload as SaaS.JobCreate);
          }
          message.success(
            f(`message.${editRecord ? 'updateSuccess' : 'createSuccess'}`),
          );
          setModalOpen(false);
          actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={f('pages.job.name')}
            rules={[{ required: true }]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            name="handler"
            label={f('pages.job.handler')}
            rules={[{ required: true }]}
          >
            <Select options={handlerOptions} />
          </Form.Item>
          <Form.Item
            name="cronExpression"
            label={f('pages.job.cron')}
            extra={f('pages.job.cronTip')}
            rules={[{ required: true }]}
          >
            <Input placeholder="0 * * * *" />
          </Form.Item>
          <Form.Item
            name="group"
            label={f('pages.job.group')}
            rules={[{ required: true }]}
            initialValue="default"
          >
            <Select options={groupDict.options} />
          </Form.Item>
          <Form.Item name="params" label={f('pages.job.params')}>
            <Input.TextArea rows={2} placeholder={'{"key": "value"}'} />
          </Form.Item>
          <Form.Item
            name="misfirePolicy"
            label={f('pages.job.misfirePolicy')}
            extra={f('pages.job.misfirePolicyTip')}
            initialValue="fire_once"
          >
            <Select options={misfireDict.options} />
          </Form.Item>
          <Form.Item
            name="concurrent"
            label={f('pages.job.concurrent')}
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Space size={16} align="start" wrap>
            <Form.Item
              name="timeout"
              label={f('pages.job.timeout')}
              initialValue={30}
            >
              <InputNumber
                min={1}
                max={3600}
                addonAfter={f('pages.job.seconds')}
              />
            </Form.Item>
            <Form.Item
              name="maxRetry"
              label={f('pages.job.maxRetry')}
              initialValue={0}
            >
              <InputNumber min={0} max={10} addonAfter={f('pages.job.times')} />
            </Form.Item>
            <Form.Item
              name="retryInterval"
              label={f('pages.job.retryInterval')}
              initialValue={10}
            >
              <InputNumber
                min={1}
                max={3600}
                addonAfter={f('pages.job.seconds')}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label={f('entity.status')}
              initialValue="active"
              hidden
            >
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="remark" label={f('entity.remark')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default JobList;
