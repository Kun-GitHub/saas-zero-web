import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { createDept, deleteDept, getDeptList, updateDept } from '@/services/saas-zero/dept';

const DeptList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<any>[] = [
    { title: f('entity.deptName'), dataIndex: 'name', width: 200 },
    { title: f('entity.log.operator'), dataIndex: 'leader', width: 120, hideInSearch: true },
    { title: f('entity.mobile'), dataIndex: 'phone', width: 140, hideInSearch: true },
    { title: f('entity.status'), dataIndex: 'status', width: 80, render: (_, r) => <Tag color={r.status === 'active' ? 'green' : 'red'}>{f(`status.${r.status}`)}</Tag> },
    { title: f('entity.sort'), dataIndex: 'sort', width: 60, hideInSearch: true },
    {
      title: f('entity.action'), width: 140, hideInSearch: true, render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }}>{f('entity.edit')}</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: f('pages.system.dept.deleteConfirm'), onOk: async () => { await deleteDept([Number(r.id)]); message.success(f('message.deleteSuccess')); actionRef.current?.reload(); } })}>{f('entity.delete')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<any>
        rowKey="id" actionRef={actionRef} columns={columns}
        request={async () => { const data = await getDeptList(); return { data, success: true, total: data.length }; }}
        toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>{f('pages.system.dept.create')}</Button>]}
        search={false} pagination={false}
      />
      <Modal
        title={f(editRecord ? 'pages.system.dept.edit' : 'pages.system.dept.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) { await updateDept({ ...values, id: editRecord.id }); } else { await createDept(values); }
          message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess'))); setModalOpen(false); actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={f('entity.deptName')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="leader" label={f('entity.log.operator')}><Input /></Form.Item>
          <Form.Item name="phone" label={f('entity.mobile')}><Input /></Form.Item>
          <Form.Item name="sort" label={f('entity.sort')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'inactive', label: f('status.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DeptList;