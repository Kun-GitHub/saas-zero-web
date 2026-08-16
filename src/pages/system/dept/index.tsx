import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';
import {
  createDept,
  deleteDept,
  getDeptTree,
  updateDept,
} from '@/services/saas-zero/dept';
import { formatDateTime } from '@/utils/datetime';
import { usePermission } from '@/utils/permission';

const flattenTree = (
  items: any[],
  depth = 0,
): { id: string; name: string }[] => {
  const result: { id: string; name: string }[] = [];
  for (const item of items) {
    result.push({
      id: item.idStr,
      name: `${'  '.repeat(depth)}${depth > 0 ? '└ ' : ''}${item.name}`,
    });
    if (item.children?.length) {
      result.push(...flattenTree(item.children, depth + 1));
    }
  }
  return result;
};

// 去掉空 children：antd 树形表格只要存在 children 字段（即使为空数组）
// 就会显示展开箭头，导致叶子节点也出现多余的展开按钮。
const stripEmptyChildren = (items: any[]): any[] =>
  (items || []).map((item) => {
    const node = { ...item };
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children = stripEmptyChildren(node.children);
    } else {
      delete node.children;
    }
    return node;
  });

const DeptList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [parentOptions, setParentOptions] = useState<
    { id: string; name: string }[]
  >([]);
  // 新增下级部门时记录的上级部门（用于默认选中 + 标题展示）
  const [createParentName, setCreateParentName] = useState<string | undefined>(
    undefined,
  );

  const f = (id: string) => intl.formatMessage({ id });

  const openCreateModal = async () => {
    setEditRecord(null);
    setCreateParentName(undefined);
    form.resetFields();
    try {
      const res = await getDeptTree();
      setParentOptions(flattenTree(res));
    } catch {
      setParentOptions([]);
    }
    setModalOpen(true);
  };

  const openAddChildModal = async (record: any) => {
    setEditRecord(null);
    setCreateParentName(record.name);
    form.resetFields();
    form.setFieldsValue({ parentId: record.idStr });
    try {
      const res = await getDeptTree();
      setParentOptions(flattenTree(res));
    } catch {
      setParentOptions([]);
    }
    setModalOpen(true);
  };

  const openEditModal = async (record: any) => {
    setEditRecord(record);
    form.setFieldsValue({
      ...record,
      parentId: record.parentIdStr || undefined,
    });
    try {
      const res = await getDeptTree();
      setParentOptions(flattenTree(res));
    } catch {
      setParentOptions([]);
    }
    setModalOpen(true);
  };

  const columns: ProColumns<any>[] = [
    { title: f('entity.deptName'), dataIndex: 'name', width: 200 },
    {
      title: f('entity.log.operator'),
      dataIndex: 'leaderName',
      width: 120,
      hideInSearch: true,
    },
    {
      title: f('entity.mobile'),
      dataIndex: 'phone',
      width: 140,
      hideInSearch: true,
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
      title: f('entity.sort'),
      dataIndex: 'sort',
      width: 60,
      hideInSearch: true,
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
          {can('system:dept:update') && (
            <Button type="link" size="small" onClick={() => openEditModal(r)}>
              {f('entity.edit')}
            </Button>
          )}
          {can('system:dept:create') && (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openAddChildModal(r)}
            >
              {f('pages.system.dept.addChild')}
            </Button>
          )}
          {can('system:dept:delete') && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                modal.confirm({
                  title: f('pages.system.dept.deleteConfirm'),
                  onOk: async () => {
                    await deleteDept([r.idStr]);
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
      <ProTable<any>
        rowKey="idStr"
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          const res = await getDeptTree();
          return {
            data: stripEmptyChildren(res),
            success: true,
            total: res.length,
          };
        }}
        toolBarRender={() => [
          can('system:dept:create') && (
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              {f('pages.system.dept.create')}
            </Button>
          ),
        ]}
        search={false}
        pagination={false}
      />
      <Modal
        title={f(
          editRecord
            ? 'pages.system.dept.edit'
            : createParentName
              ? 'pages.system.dept.createChild'
              : 'pages.system.dept.create',
        )}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) {
            await updateDept({ ...values, id: editRecord.idStr });
          } else {
            await createDept(values);
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
            label={f('entity.deptName')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="parentId" label={f('entity.menu.parent')}>
            <Select
              allowClear
              options={parentOptions.map((o) => ({
                value: o.id,
                label: o.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="phone" label={f('entity.mobile')}>
            <Input />
          </Form.Item>
          <Form.Item
            name="sort"
            label={f('entity.sort')}
            rules={[{ required: true, message: f('validation.sortRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} />
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
    </>
  );
};

export default DeptList;
