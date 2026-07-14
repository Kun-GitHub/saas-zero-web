import {
  DeleteOutlined,
  KeyOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  TreeSelect,
} from 'antd';
import React, { useRef, useState } from 'react';
import { getDeptTree } from '@/services/saas-zero/dept';
import { getRoleList } from '@/services/saas-zero/role';
import {
  assignUserRoles,
  createUser,
  deleteUser,
  getUserList,
  resetUserPassword,
  updateUser,
} from '@/services/saas-zero/user';

const statusColor: Record<string, string> = {
  active: 'green',
  inactive: 'red',
  frozen: 'orange',
  expired: 'default',
};

const UserList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SaaS.SysUser | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<SaaS.SysUser | null>(null);
  const [allRoles, setAllRoles] = useState<SaaS.SysRole[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<SaaS.SysUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [deptTree, setDeptTree] = useState<any[]>([]);

  const loadDeptTree = async () => {
    try {
      const data = await getDeptTree();
      setDeptTree(data || []);
    } catch {
      setDeptTree([]);
    }
  };

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<SaaS.SysUser>[] = [
    { title: f('entity.username'), dataIndex: 'username', width: 120 },
    { title: f('entity.nickname'), dataIndex: 'nickname', width: 120 },
    { title: f('entity.mobile'), dataIndex: 'mobile', width: 130 },
    {
      title: f('entity.email'),
      dataIndex: 'email',
      width: 180,
      hideInSearch: true,
    },
    {
      title: f('entity.dept'),
      dataIndex: 'deptName',
      width: 120,
      hideInSearch: true,
    },
    {
      title: f('entity.role'),
      dataIndex: 'roleNames',
      width: 160,
      hideInSearch: true,
      render: (_, r) => r.roleNames?.map((n) => <Tag key={n}>{n}</Tag>),
    },
    {
      title: f('entity.status'),
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        active: { text: f('status.active'), status: 'Success' },
        inactive: { text: f('status.inactive'), status: 'Error' },
      },
      render: (_, r) => (
        <Tag color={statusColor[r.status]}>{f(`status.${r.status}`)}</Tag>
      ),
    },
    {
      title: f('entity.lastLogin'),
      dataIndex: 'lastLoginAt',
      width: 170,
      hideInSearch: true,
    },
    {
      title: f('entity.createdAt'),
      dataIndex: 'createdAt',
      width: 170,
      hideInSearch: true,
    },
    {
      title: f('entity.action'),
      width: 260,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditRecord(record);
              form.setFieldsValue(record);
              loadDeptTree();
              setModalOpen(true);
            }}
          >
            {f('entity.edit')}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => openPwdModal(record)}
          >
            {f('pages.system.user.resetPassword')}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<TeamOutlined />}
            onClick={() => openRoleModal(record)}
          >
            {f('pages.system.user.assignRoles')}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={async () => {
              Modal.confirm({
                title: f('pages.system.user.deleteConfirm'),
                onOk: async () => {
                  await deleteUser([record.idStr!]);
                  message.success(f('message.deleteSuccess'));
                  actionRef.current?.reload();
                },
              });
            }}
          >
            {f('entity.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  const openRoleModal = async (user: SaaS.SysUser) => {
    setRoleUser(user);
    setSelectedRoleIds(user.roleIds || []);
    const res = await getRoleList({ page: 1, pageSize: 9999 });
    setAllRoles(res.list || []);
    setRoleModalOpen(true);
  };

  const handleRoleOk = async () => {
    if (!roleUser) return;
    await assignUserRoles({ id: roleUser.idStr!, roleIds: selectedRoleIds });
    message.success(f('message.assignSuccess'));
    setRoleModalOpen(false);
    actionRef.current?.reload();
  };

  const openPwdModal = (user: SaaS.SysUser) => {
    setPwdUser(user);
    setNewPassword('');
    setPwdModalOpen(true);
  };

  const handlePwdOk = async () => {
    if (!pwdUser || !newPassword) return;
    await resetUserPassword({ id: pwdUser.idStr!, password: newPassword });
    message.success(f('message.resetSuccess'));
    setPwdModalOpen(false);
  };

  const handleBatchDelete = async () => {
    Modal.confirm({
      title: f('pages.system.user.batchDeleteConfirm'),
      content: f('pages.system.user.batchDeleteContent').replace(
        '{count}',
        String(selectedRowKeys.length),
      ),
      onOk: async () => {
        await deleteUser(selectedRowKeys as string[]);
        message.success(f('message.deleteSuccess'));
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  return (
    <>
      <ProTable<SaaS.SysUser>
        rowKey="idStr"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const res = await getUserList({
            page: params.current || 1,
            pageSize: params.pageSize || 10,
            username: params.username,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        toolBarRender={() => [
          selectedRowKeys.length > 0 && (
            <Button
              key="batchDelete"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              {f('pages.system.user.batchDelete')}
            </Button>
          ),
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRecord(null);
              form.resetFields();
              loadDeptTree();
              setModalOpen(true);
            }}
          >
            {f('pages.system.user.create')}
          </Button>,
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
        title={f(
          editRecord ? 'pages.system.user.edit' : 'pages.system.user.create',
        )}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) {
            await updateUser({ ...values, id: editRecord.idStr! });
          } else {
            await createUser(values);
          }
          message.success(
            f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess')),
          );
          setModalOpen(false);
          actionRef.current?.reload();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label={f('entity.username')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {!editRecord && (
            <Form.Item
              name="password"
              label={f('entity.password')}
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="nickname" label={f('entity.nickname')}>
            <Input />
          </Form.Item>
          <Form.Item name="mobile" label={f('entity.mobile')}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={f('entity.email')}>
            <Input />
          </Form.Item>
          <Form.Item name="deptId" label={f('entity.dept')}>
            <TreeSelect
              allowClear
              placeholder={f('entity.dept')}
              treeData={deptTree}
              fieldNames={{
                label: 'name',
                value: 'idStr',
                children: 'children',
              }}
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item
            name="status"
            label={f('entity.status')}
            rules={[{ required: true }]}
            initialValue="active"
          >
            <Select
              options={[
                { value: 'active', label: f('status.active') },
                { value: 'inactive', label: f('status.inactive') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          f('pages.system.user.assignRoles') +
          (roleUser ? ` - ${roleUser.username}` : '')
        }
        open={roleModalOpen}
        onOk={handleRoleOk}
        onCancel={() => setRoleModalOpen(false)}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={allRoles.map((r) => ({ value: r.idStr!, label: r.name }))}
          placeholder={f('pages.system.user.assignRoles')}
        />
      </Modal>
      <Modal
        title={
          f('pages.system.user.resetPassword') +
          (pwdUser ? ` - ${pwdUser.username}` : '')
        }
        open={pwdModalOpen}
        onOk={handlePwdOk}
        onCancel={() => setPwdModalOpen(false)}
      >
        <Input.Password
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={f('entity.newPassword')}
        />
      </Modal>
    </>
  );
};

export default UserList;
