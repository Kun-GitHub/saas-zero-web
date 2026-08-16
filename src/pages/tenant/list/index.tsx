import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { getPackageList } from '@/services/saas-zero/package';
import {
  createTenant,
  deleteTenant,
  getTenantDetail,
  getTenantList,
  getTenantUsers,
  updateTenant,
} from '@/services/saas-zero/tenant';
import { formatDateTime } from '@/utils/datetime';
import { usePermission } from '@/utils/permission';

const statusColor: Record<string, string> = {
  active: 'green',
  frozen: 'orange',
  expired: 'red',
};

const TenantList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [packageList, setPackageList] = useState<SaaS.SysPackage[]>([]);
  const [tenantUsers, setTenantUsers] = useState<
    { idStr: string; username: string; nickname: string }[]
  >([]);

  const loadPackages = async () => {
    const res = await getPackageList({ page: 1, pageSize: 100 }).catch(() => ({
      list: [],
    }));
    setPackageList(res.list || []);
  };

  const openCreateModal = async () => {
    setEditRecord(null);
    form.resetFields();
    await loadPackages();
    setModalOpen(true);
  };

  const openEditModal = async (record: any) => {
    setEditRecord(record);
    form.resetFields();
    await loadPackages();
    const users = await getTenantUsers(record.idStr).catch(() => ({
      list: [],
    }));
    setTenantUsers(users.list || []);
    form.setFieldsValue({
      ...record,
      packageId: record.packageIdStr || undefined,
      adminId: record.adminIdStr || undefined,
      expiredAt: record.expiredAt ? dayjs(record.expiredAt) : undefined,
    });
    setModalOpen(true);
  };

  const f = (id: string) => intl.formatMessage({ id });

  const columns: ProColumns<any>[] = [
    { title: f('entity.tenant.name'), dataIndex: 'name', width: 140 },
    { title: f('entity.tenant.code'), dataIndex: 'code', width: 120 },
    {
      title: f('entity.tenant.admin'),
      dataIndex: 'adminName',
      width: 100,
      hideInSearch: true,
    },
    {
      title: f('entity.tenant.package'),
      dataIndex: 'packageName',
      width: 100,
      hideInSearch: true,
    },
    {
      title: f('entity.tenant.expiry'),
      dataIndex: 'expiredAt',
      width: 170,
      hideInSearch: true,
      renderText: (value) => formatDateTime(value),
    },
    {
      title: f('entity.status'),
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        active: { text: f('status.normal') },
        frozen: { text: f('status.frozen') },
        expired: { text: f('status.expired') },
      },
      render: (_, r) => (
        <Tag color={statusColor[r.status]}>{f(`status.${r.status}`)}</Tag>
      ),
    },
    {
      title: f('entity.updatedAt'),
      dataIndex: 'updatedAt',
      width: 170,
      hideInSearch: true,
      renderText: (value) => formatDateTime(value),
    },
    {
      title: f('entity.updatedBy'),
      dataIndex: 'updatedBy',
      width: 110,
      hideInSearch: true,
    },
    {
      title: f('entity.action'),
      width: 200,
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {can('system:tenant:update') && (
            <Button type="link" size="small" onClick={() => openEditModal(r)}>
              {f('entity.edit')}
            </Button>
          )}
          {can('system:tenant:delete') && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                modal.confirm({
                  title: f('pages.tenant.list.deleteConfirm'),
                  onOk: async () => {
                    await deleteTenant([r.idStr]);
                    message.success(f('message.deleteSuccess'));
                    actionRef.current?.reload();
                  },
                })
              }
            >
              {f('entity.delete')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable
        rowKey="idStr"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const res = await getTenantList({
            page: params.current || 1,
            pageSize: params.pageSize || 10,
            name: params.name,
            status: params.status,
          });
          return { data: res.list, success: true, total: res.total };
        }}
        toolBarRender={() => [
          can('system:tenant:create') && (
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              {f('pages.tenant.list.create')}
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
        title={f(
          editRecord ? 'pages.tenant.list.edit' : 'pages.tenant.list.create',
        )}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          const body = {
            ...values,
            expiredAt: values.expiredAt
              ? values.expiredAt.format('YYYY-MM-DD')
              : undefined,
          };
          if (editRecord) {
            await updateTenant({ ...body, id: editRecord.idStr });
          } else {
            await createTenant(body);
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
            name="name"
            label={f('entity.tenant.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={f('entity.tenant.code')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="packageId"
            label={f('entity.tenant.package')}
            rules={[
              { required: true, message: f('entity.tenant.packageRequired') },
            ]}
          >
            <Select
              placeholder={f('entity.tenant.packagePlaceholder')}
              options={packageList.map((p) => ({
                value: p.idStr!,
                label: p.name,
              }))}
            />
          </Form.Item>
          {!editRecord && (
            <>
              <Form.Item
                name="username"
                label={f('entity.tenant.adminAccount')}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label={f('entity.tenant.adminPassword')}
                rules={[{ required: true }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </>
          )}
          {editRecord && (
            <Form.Item name="adminId" label={f('entity.tenant.admin')}>
              <Select
                allowClear
                placeholder={f('entity.tenant.adminPlaceholder')}
                options={tenantUsers.map((u) => ({
                  value: u.idStr,
                  label: `${u.nickname || u.username} (${u.username})`,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item name="expiredAt" label={f('entity.tenant.expiry')}>
            <DatePicker style={{ width: '100%' }} />
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
                { value: 'frozen', label: f('status.frozen') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TenantList;
