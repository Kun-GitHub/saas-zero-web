import {
  ApartmentOutlined,
  CodeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Checkbox, Form, Input, InputNumber, Modal, Select, Space, Tag, Tree } from 'antd';
import React, { useRef, useState } from 'react';
import { assignRoleApis, assignRoleMenus, createRole, deleteRole, getRoleList, updateRole } from '@/services/saas-zero/role';
import { getApiList } from '@/services/saas-zero/api';
import { getMenuTree } from '@/services/saas-zero/menu';

const statusColor: Record<string, string> = { active: 'green', inactive: 'red' };

const RoleList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SaaS.SysRole | null>(null);
  const [form] = Form.useForm();

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [menuRole, setMenuRole] = useState<SaaS.SysRole | null>(null);
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [checkedMenuKeys, setCheckedMenuKeys] = useState<React.Key[]>([]);

  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiRole, setApiRole] = useState<SaaS.SysRole | null>(null);
  const [apiList, setApiList] = useState<SaaS.SysApi[]>([]);
  const [checkedApiIds, setCheckedApiIds] = useState<React.Key[]>([]);

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<SaaS.SysRole>[] = [
    { title: f('entity.roleName'), dataIndex: 'name', width: 140 },
    { title: f('entity.roleCode'), dataIndex: 'code', width: 120 },
    { title: f('entity.status'), dataIndex: 'status', width: 80, valueType: 'select', valueEnum: { active: { text: f('status.active'), status: 'Success' }, inactive: { text: f('status.inactive'), status: 'Error' } }, render: (_, r) => <Tag color={statusColor[r.status]}>{f(`status.${r.status}`)}</Tag> },
    { title: f('entity.sort'), dataIndex: 'sort', width: 60, hideInSearch: true },
    { title: f('entity.remark'), dataIndex: 'remark', width: 200, ellipsis: true, hideInSearch: true },
    { title: f('entity.createdAt'), dataIndex: 'createdAt', width: 170, hideInSearch: true },
    {
      title: f('entity.action'), width: 360, hideInSearch: true, render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true); }}>{f('entity.edit')}</Button>
          <Button type="link" size="small" icon={<ApartmentOutlined />} onClick={() => openMenuModal(r)}>{f('pages.system.role.assignMenus')}</Button>
          <Button type="link" size="small" icon={<CodeOutlined />} onClick={() => openApiModal(r)}>{f('pages.system.role.assignApis')}</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: f('pages.system.role.deleteConfirm'), onOk: async () => { await deleteRole([Number(r.id)]); message.success(f('message.deleteSuccess')); actionRef.current?.reload(); } })}>{f('entity.delete')}</Button>
        </Space>
      ),
    },
  ];

  const openMenuModal = (r: SaaS.SysRole) => {
    setMenuRole(r);
    setCheckedMenuKeys([]);
    loadMenuTree();
    setMenuModalOpen(true);
  };

  const loadMenuTree = async () => {
    const data = await getMenuTree();
    setMenuTree(data || []);
  };

  const handleMenuOk = async () => {
    if (!menuRole) return;
    await assignRoleMenus({ id: Number(menuRole.id), menuIds: checkedMenuKeys.map(Number) });
    message.success(f('message.assignSuccess'));
    setMenuModalOpen(false);
  };

  const openApiModal = async (r: SaaS.SysRole) => {
    setApiRole(r);
    setCheckedApiIds([]);
    const res = await getApiList({ page: 1, pageSize: 9999 });
    setApiList(res.list || []);
    setApiModalOpen(true);
  };

  const handleApiOk = async () => {
    if (!apiRole) return;
    await assignRoleApis({ id: Number(apiRole.id), apiIds: checkedApiIds.map(Number) });
    message.success(f('message.assignSuccess'));
    setApiModalOpen(false);
  };

  return (
    <>
      <ProTable rowKey="id" actionRef={actionRef} columns={columns}
        request={async (params) => {
          const res = await getRoleList({ page: params.current || 1, pageSize: params.pageSize || 10, name: params.name, status: params.status });
          return { data: res.list, success: true, total: res.total };
        }}
        toolBarRender={() => [<Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true); }}>{f('pages.system.role.create')}</Button>]}
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => f('entity.totalRecords').replace('{total}', String(total)) }}
      />
      <Modal
        title={f(editRecord ? 'pages.system.role.edit' : 'pages.system.role.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) { await updateRole({ ...values, id: Number(editRecord.id) }); } else { await createRole(values); }
          message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess')));
          setModalOpen(false); actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={f('entity.roleName')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label={f('entity.roleCode')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort" label={f('entity.sort')}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'inactive', label: f('status.inactive') }]} />
          </Form.Item>
          <Form.Item name="remark" label={f('entity.remark')}><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
      <Modal
        title={f('pages.system.role.assignMenus') + (menuRole ? ` - ${menuRole.name}` : '')}
        open={menuModalOpen}
        onOk={handleMenuOk}
        onCancel={() => setMenuModalOpen(false)}
        width={500}
      >
        <Tree
          checkable
          treeData={menuTree}
          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
          checkedKeys={checkedMenuKeys}
          onCheck={(keys) => setCheckedMenuKeys(keys as React.Key[])}
          defaultExpandAll
        />
      </Modal>
      <Modal
        title={f('pages.system.role.assignApis') + (apiRole ? ` - ${apiRole.name}` : '')}
        open={apiModalOpen}
        onOk={handleApiOk}
        onCancel={() => setApiModalOpen(false)}
        width={700}
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {apiList.map((api) => (
            <div key={api.id} style={{ padding: '4px 0' }}>
              <Checkbox
                checked={checkedApiIds.includes(api.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedApiIds([...checkedApiIds, api.id]);
                  } else {
                    setCheckedApiIds(checkedApiIds.filter((k) => k !== api.id));
                  }
                }}
              >
                <Tag color="blue">{api.method}</Tag> {api.path}
                <span style={{ marginLeft: 8, color: '#999' }}>{api.name}</span>
              </Checkbox>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default RoleList;
