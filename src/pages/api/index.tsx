import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Form, Input, Modal, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { createApi, deleteApi, getApiList, updateApi } from '@/services/saas-zero/api';

const methodColor: Record<string, string> = { POST: 'green', GET: 'blue', PUT: 'orange', DELETE: 'red', PATCH: 'purple' };

const ApiList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const f = (id: string) => intl.formatMessage({ id });
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<any>[] = [
    { title: f('entity.api.name'), dataIndex: 'name', width: 140 },
    { title: f('entity.api.path'), dataIndex: 'path', width: 280 },
    { title: f('entity.api.method'), dataIndex: 'method', width: 100, render: (_, r) => <Tag color={methodColor[r.method]}>{r.method}</Tag> },
    { title: f('entity.status'), dataIndex: 'status', width: 80, render: (_, r) => <Tag color={r.status === 'active' ? 'green' : 'red'}>{f(`status.${r.status}`)}</Tag> },
    {
      title: f('entity.action'), width: 140, hideInSearch: true, render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }}>{f('entity.edit')}</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: f('pages.api.deleteConfirm'), onOk: async () => { await deleteApi(r.id); message.success(f('message.deleteSuccess')); actionRef.current?.reload(); } })}>{f('entity.delete')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable rowKey="id" actionRef={actionRef} columns={columns}
        request={async (params) => {
          const res = await getApiList({ page: params.current || 1, pageSize: params.pageSize || 10, name: params.name, method: params.method, status: params.status });
          return { data: res.list, success: true, total: res.total };
        }}
        toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>{f('pages.api.create')}</Button>]}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={f(editRecord ? 'pages.api.edit' : 'pages.api.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) { await updateApi({ ...values, id: editRecord.id }); } else { await createApi(values); }
          message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess'))); setModalOpen(false); actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={f('entity.api.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="path" label={f('entity.api.path')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="method" label={f('entity.api.method')} rules={[{ required: true }]} initialValue="GET">
            <Select options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({ value: m, label: <><Tag color={methodColor[m]}>{m}</Tag></> }))} />
          </Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'inactive', label: f('status.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ApiList;