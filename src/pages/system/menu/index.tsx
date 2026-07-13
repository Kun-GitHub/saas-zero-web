import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { createMenu, deleteMenu, getMenuTree, updateMenu } from '@/services/saas-zero/menu';

const typeColor: Record<string, string> = { directory: 'blue', menu: 'green', button: 'orange' };

const flattenTree = (items: any[], depth = 0): { id: string; name: string }[] => {
  const result: { id: string; name: string }[] = [];
  for (const item of items) {
    if (item.menuType !== 'button') {
      result.push({ id: item.id, name: `${'  '.repeat(depth)}${depth > 0 ? '└ ' : ''}${item.name}` });
    }
    if (item.children?.length) {
      result.push(...flattenTree(item.children, depth + 1));
    }
  }
  return result;
};

const MenuList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [parentOptions, setParentOptions] = useState<{ id: string; name: string }[]>([]);

  const f = (id: string) => intl.formatMessage({ id });

  const openCreateModal = async () => {
    setEditRecord(null);
    form.resetFields();
    try {
      const res = await getMenuTree();
      setParentOptions(flattenTree(res));
    } catch { setParentOptions([]); }
    setModalOpen(true);
  };

  const openEditModal = async (record: any) => {
    setEditRecord(record);
    form.setFieldsValue(record);
    try {
      const res = await getMenuTree();
      setParentOptions(flattenTree(res));
    } catch { setParentOptions([]); }
    setModalOpen(true);
  };

  const columns: ProColumns<any>[] = [
    { title: f('entity.menu.name'), dataIndex: 'name', width: 200 },
    { title: f('entity.menu.type'), dataIndex: 'menuType', width: 100, render: (_, r) => <Tag color={typeColor[r.menuType]}>{f(`entity.menu.${r.menuType}`)}</Tag> },
    { title: f('entity.menu.path'), dataIndex: 'path', width: 200, hideInSearch: true },
    { title: f('entity.menu.icon'), dataIndex: 'icon', width: 80, hideInSearch: true },
    { title: f('entity.status'), dataIndex: 'status', width: 80, render: (_, r) => <Tag color={r.status === 'active' ? 'green' : 'red'}>{f(`status.${r.status}`)}</Tag> },
    { title: f('entity.sort'), dataIndex: 'sort', width: 60, hideInSearch: true },
    {
      title: f('entity.action'), width: 140, hideInSearch: true, render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEditModal(r)}>{f('entity.edit')}</Button>
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
          const res = await getMenuTree();
          return { data: res, success: true, total: res.length };
        }}
        toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>{f('pages.system.menu.create')}</Button>]}
        search={false}
        pagination={false}
      />
      <Modal
        title={f(editRecord ? 'pages.system.menu.edit' : 'pages.system.menu.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) { await updateMenu({ ...values, id: Number(editRecord.id) }); } else { await createMenu(values); }
          message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess')));
          setModalOpen(false); actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={f('entity.menu.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="menuType" label={f('entity.menu.type')} rules={[{ required: true }]} initialValue="menu">
            <Select options={[{ value: 'directory', label: f('entity.menu.directory') }, { value: 'menu', label: f('entity.menu.menu') }, { value: 'button', label: f('entity.menu.button') }]} />
          </Form.Item>
          <Form.Item name="parentId" label={f('entity.menu.parent')}>
            <Select allowClear options={parentOptions.map((o) => ({ value: Number(o.id), label: o.name }))} />
          </Form.Item>
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
