import { DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { changeTenantStatus, createTenant, deleteTenant, getTenantList, updateTenant } from '@/services/saas-zero/tenant';

const statusColor: Record<string, string> = { active: 'green', frozen: 'orange', expired: 'red' };

const TenantList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<any>[] = [
    { title: f('entity.tenant.name'), dataIndex: 'name', width: 140 },
    { title: f('entity.tenant.code'), dataIndex: 'code', width: 120 },
    { title: f('entity.tenant.admin'), dataIndex: 'adminId', width: 100, hideInSearch: true },
    { title: f('entity.tenant.package'), dataIndex: 'packageName', width: 100, hideInSearch: true },
    { title: f('entity.tenant.expiry'), dataIndex: 'expiredAt', width: 120, hideInSearch: true },
    { title: f('entity.status'), dataIndex: 'status', width: 80, valueType: 'select', valueEnum: { active: { text: f('status.normal') }, frozen: { text: f('status.frozen') }, expired: { text: f('status.expired') } }, render: (_, r) => <Tag color={statusColor[r.status]}>{f(`status.${r.status}`)}</Tag> },
    { title: f('entity.createdAt'), dataIndex: 'createdAt', width: 170, hideInSearch: true },
    {
      title: f('entity.action'), width: 200, hideInSearch: true, render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }}>{f('entity.edit')}</Button>
          <Button type="link" size="small" icon={<SwapOutlined />} onClick={async () => { await changeTenantStatus({ id: r.id, status: r.status === 'active' ? 'frozen' : 'active' }); message.success(f('message.operationSuccess')); actionRef.current?.reload(); }}>{f('entity.status')}</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: f('pages.tenant.list.deleteConfirm'), onOk: async () => { await deleteTenant([Number(r.id)]); message.success(f('message.deleteSuccess')); actionRef.current?.reload(); } })}>{f('entity.delete')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable rowKey="id" actionRef={actionRef} columns={columns}
        request={async (params) => {
          const res = await getTenantList({ page: params.current || 1, pageSize: params.pageSize || 10, name: params.name, status: params.status });
          return { data: res.list, success: true, total: res.total };
        }}
        toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>{f('pages.tenant.list.create')}</Button>]}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => f('entity.totalRecords').replace('{total}', String(total)) }}
      />
      <Modal
        title={f(editRecord ? 'pages.tenant.list.edit' : 'pages.tenant.list.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) { await updateTenant({ ...values, id: editRecord.id }); } else { await createTenant(values); }
          message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess'))); setModalOpen(false); actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={f('entity.tenant.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label={f('entity.tenant.code')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="adminId" label={f('entity.tenant.admin')}><Input placeholder="User ID" /></Form.Item>
          <Form.Item name="expiredAt" label={f('entity.tenant.expiry')}><Input placeholder="2099-12-31" /></Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'frozen', label: f('status.frozen') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TenantList;