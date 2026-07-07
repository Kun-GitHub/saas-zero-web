import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { createMenu, deleteMenu, getMenuList, updateMenu } from '@/services/saas-zero/menu';

const typeColor: Record<string, string> = { directory: 'blue', menu: 'green', button: 'orange' };

const MenuList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<any>[] = [
    { title: f('entity.menu.name'), dataIndex: 'name', width: 200 },
    { title: f('entity.menu.type'), dataIndex: 'type', width: 100, render: (_, r) => <Tag color={typeColor[r.type]}>{f(`entity.menu.${r.type}`)}</Tag> },
    { title: f('entity.menu.path'), dataIndex: 'path', width: 200, hideInSearch: true },
    { title: f('entity.menu.icon'), dataIndex: 'icon', width: 80, hideInSearch: true },
    { title: f('entity.status'), dataIndex: 'status', width: 80, render: (_, r) => <Tag color={r.status === 'active' ? 'green' : 'red'}>{f(`status.${r.status}`)}</Tag> },
    { title: f('entity.sort'), dataIndex: 'sort', width: 60, hideInSearch: true },
    {
      title: f('entity.action'), width: 140, hideInSearch: true, render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }}>{f('entity.edit')}</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: f('pages.system.menu.deleteConfirm'), onOk: async () => { await deleteMenu([Number(r.id)]); message.success(f('message.deleteSuccess')); actionRef.current?.reload(); } })}>{f('entity.delete')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<any>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          const data = await getMenuList();
          return { data, success: true, total: data.length };
        }}
        toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>{f('pages.system.menu.create')}</Button>]}
        search={false}
        pagination={false}
      />
      <Modal
        title={f(editRecord ? 'pages.system.menu.edit' : 'pages.system.menu.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) { await updateMenu({ ...values, id: editRecord.id }); } else { await createMenu(values); }
          message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess')));
          setModalOpen(false); actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={f('entity.menu.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label={f('entity.menu.type')} rules={[{ required: true }]} initialValue="menu">
            <Select options={[{ value: 'directory', label: f('entity.menu.directory') }, { value: 'menu', label: f('entity.menu.menu') }, { value: 'button', label: f('entity.menu.button') }]} />
          </Form.Item>
          <Form.Item name="parentId" label={f('entity.menu.parent')}><Select allowClear /></Form.Item>
          <Form.Item name="path" label={f('entity.menu.path')}><Input /></Form.Item>
          <Form.Item name="icon" label={f('entity.menu.icon')}><Input /></Form.Item>
          <Form.Item name="sort" label={f('entity.sort')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'inactive', label: f('status.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MenuList;