import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { App, Button, Form, Input, Modal, Select, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createApi,
  deleteApi,
  getApiList,
  updateApi,
} from '@/services/saas-zero/api';
import { formatDateTime } from '@/utils/datetime';

const methodColor: Record<string, string> = {
  POST: 'green',
  GET: 'blue',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple',
};

// 把平铺的 API 列表组织成 目录(group) + 接口(api) 两级树。
// 目录 path 是前缀（如 /system/user），接口 path 以目录 path 开头。
const buildApiTree = (apis: any[]): any[] => {
  const groups = apis.filter((a) => a.apiType === 'group');
  const items = apis.filter((a) => a.apiType === 'api');
  return groups
    .map((g) => ({
      ...g,
      children: items.filter((i) => i.apiPath.startsWith(`${g.apiPath}/`)),
    }))
    .filter((g) => g.children.length > 0);
};

// 去掉空 children：树形表格只要存在 children 字段（即使空数组）就会显示展开箭头
const cleanTree = (items: any[]): any[] =>
  items.map((item) => {
    const copy = { ...item };
    if (copy.children?.length) {
      copy.children = cleanTree(copy.children);
    } else {
      delete copy.children;
    }
    return copy;
  });

const ApiList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const f = (id: string) => intl.formatMessage({ id });
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const apiType = Form.useWatch('apiType', form);

  const columns: ProColumns<any>[] = [
    { title: f('entity.api.name'), dataIndex: 'apiName', width: 200 },
    {
      title: f('entity.api.type'),
      dataIndex: 'apiType',
      width: 80,
      hideInSearch: true,
      render: (_, r) => (
        <Tag color={r.apiType === 'group' ? 'blue' : 'green'}>
          {r.apiType === 'group' ? f('entity.menu.directory') : 'API'}
        </Tag>
      ),
    },
    {
      title: f('entity.api.path'),
      dataIndex: 'apiPath',
      width: 280,
      hideInSearch: true,
    },
    {
      title: f('entity.api.method'),
      dataIndex: 'apiMethod',
      width: 100,
      hideInSearch: true,
      render: (_, r) => {
        const m = (r.apiMethod || '').toUpperCase();
        return m ? <Tag color={methodColor[m]}>{m}</Tag> : null;
      },
    },
    {
      title: f('entity.status'),
      dataIndex: 'status',
      width: 80,
      render: (_, r) => (
        <Tag color={r.status === 'active' ? 'green' : 'red'}>
          {f(`status.${r.status}`)}
        </Tag>
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
      width: 140,
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditRecord(r);
              form.resetFields();
              form.setFieldsValue(r);
              setModalOpen(true);
            }}
          >
            {f('entity.edit')}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              modal.confirm({
                title: f('pages.api.deleteConfirm'),
                onOk: async () => {
                  await deleteApi([r.idStr]);
                  message.success(f('message.deleteSuccess'));
                  actionRef.current?.reload();
                },
              })
            }
          >
            {f('entity.delete')}
          </Button>
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
        request={async () => {
          const res = await getApiList({ page: 1, pageSize: 100 });
          return {
            data: cleanTree(buildApiTree(res.list || [])),
            success: true,
            total: res.list?.length || 0,
          };
        }}
        toolBarRender={() => [
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
            {f('pages.api.create')}
          </Button>,
        ]}
        search={false}
        pagination={false}
      />
      <Modal
        title={f(editRecord ? 'pages.api.edit' : 'pages.api.create')}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) {
            await updateApi({ ...values, id: editRecord.idStr });
          } else {
            await createApi(values);
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
            name="apiName"
            label={f('entity.api.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="apiType"
            label={f('entity.api.type')}
            rules={[{ required: true }]}
            initialValue="api"
          >
            <Select
              options={[
                { value: 'api', label: 'API' },
                { value: 'group', label: f('entity.menu.directory') },
              ]}
            />
          </Form.Item>
          <Form.Item name="apiPath" label={f('entity.api.path')}>
            <Input placeholder="/system/user/list" />
          </Form.Item>
          {apiType !== 'group' && (
            <Form.Item
              name="apiMethod"
              label={f('entity.api.method')}
              initialValue="get"
            >
              <Select
                options={['get', 'post', 'put', 'delete'].map((m) => ({
                  value: m,
                  label: (
                    <>
                      <Tag color={methodColor[m.toUpperCase()]}>
                        {m.toUpperCase()}
                      </Tag>
                    </>
                  ),
                }))}
              />
            </Form.Item>
          )}
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
    </>
  );
};

export default ApiList;
