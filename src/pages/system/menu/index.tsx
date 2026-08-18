import {
  DeleteOutlined,
  PlusOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
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
import IconPicker from '@/components/IconPicker';
import {
  createMenu,
  deleteMenu,
  getMenuTree,
  updateMenu,
} from '@/services/saas-zero/menu';
import { formatDateTime } from '@/utils/datetime';
import { usePermission } from '@/utils/permission';

const typeColor: Record<string, string> = {
  directory: 'blue',
  menu: 'green',
  button: 'orange',
};

// 移除空 children，避免叶子节点误显示展开按钮
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

// 按关键字/状态过滤树：匹配节点及其祖先路径保留
const filterTree = (items: any[], keyword?: string, status?: string): any[] =>
  items
    .map((item) => {
      const match =
        (!keyword || item.name.includes(keyword)) &&
        (!status || item.status === status);
      const children = item.children?.length
        ? filterTree(item.children, keyword, status)
        : [];
      if (match || children.length > 0) {
        const copy = { ...item };
        if (children.length > 0) {
          copy.children = children;
        } else {
          delete copy.children;
        }
        return copy;
      }
      return null;
    })
    .filter(Boolean);

const flattenTree = (
  items: any[],
  depth = 0,
): { id: string; name: string }[] => {
  const result: { id: string; name: string }[] = [];
  for (const item of items) {
    if (item.menuType !== 'button') {
      result.push({
        id: item.idStr,
        name: `${'  '.repeat(depth)}${depth > 0 ? '└ ' : ''}${item.name}`,
      });
    }
    if (item.children?.length) {
      result.push(...flattenTree(item.children, depth + 1));
    }
  }
  return result;
};

const MenuList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const { can } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const menuType = Form.useWatch('menuType', form);
  const [parentOptions, setParentOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const f = (id: string) => intl.formatMessage({ id });

  const openCreateModal = async (parent?: any) => {
    setEditRecord(null);
    form.resetFields();
    try {
      const res = await getMenuTree();
      setParentOptions(flattenTree(res));
    } catch {
      setParentOptions([]);
    }
    if (parent) {
      form.setFieldsValue({ parentId: parent.idStr });
    }
    setModalOpen(true);
  };

  const openEditModal = async (record: any) => {
    setEditRecord(record);
    // parentId 需用字符串 idStr 回显，才能匹配上级菜单选项
    form.setFieldsValue({
      ...record,
      parentId: record.parentIdStr || undefined,
    });
    try {
      const res = await getMenuTree();
      setParentOptions(flattenTree(res));
    } catch {
      setParentOptions([]);
    }
    setModalOpen(true);
  };

  const columns: ProColumns<any>[] = [
    { title: f('entity.menu.name'), dataIndex: 'name', width: 200 },
    {
      title: f('entity.menu.type'),
      dataIndex: 'menuType',
      width: 100,
      render: (_, r) => (
        <Tag color={typeColor[r.menuType]}>
          {f(`entity.menu.${r.menuType}`)}
        </Tag>
      ),
    },
    {
      title: f('entity.menu.path'),
      dataIndex: 'path',
      width: 200,
      hideInSearch: true,
      render: (_, r) =>
        r.menuType === 'button' ? <Tag color="purple">{r.path}</Tag> : r.path,
    },
    {
      title: f('entity.menu.icon'),
      dataIndex: 'icon',
      width: 80,
      hideInSearch: true,
    },
    {
      title: f('entity.status'),
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        active: { text: f('status.active') },
        inactive: { text: f('status.inactive') },
      },
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
      width: 200,
      hideInSearch: true,
      render: (_, r) => (
        <Space>
          {can('system:menu:create') &&
            (r.menuType === 'directory' || r.menuType === 'menu') && (
              <Button
                type="link"
                size="small"
                icon={<PlusSquareOutlined />}
                onClick={() => openCreateModal(r)}
              >
                {f('pages.system.menu.addChild')}
              </Button>
            )}
          {can('system:menu:update') && (
            <Button type="link" size="small" onClick={() => openEditModal(r)}>
              {f('entity.edit')}
            </Button>
          )}
          {can('system:menu:delete') && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                modal.confirm({
                  title: f('pages.system.menu.deleteConfirm'),
                  onOk: async () => {
                    await deleteMenu([r.idStr]);
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
        request={async (params) => {
          const res = await getMenuTree();
          const tree = cleanTree(res);
          const filtered = filterTree(tree, params.name, params.status);
          return { data: filtered, success: true, total: filtered.length };
        }}
        toolBarRender={() => [
          can('system:menu:create') && (
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              {f('pages.system.menu.create')}
            </Button>
          ),
        ]}
        search={{ labelWidth: 'auto' }}
        pagination={false}
      />
      <Modal
        title={f(
          editRecord ? 'pages.system.menu.edit' : 'pages.system.menu.create',
        )}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) {
            await updateMenu({ ...values, id: editRecord.idStr });
          } else {
            await createMenu(values);
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
            label={f('entity.menu.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="menuType"
            label={f('entity.menu.type')}
            rules={[{ required: true }]}
            initialValue="menu"
          >
            <Select
              options={[
                { value: 'directory', label: f('entity.menu.directory') },
                { value: 'menu', label: f('entity.menu.menu') },
                { value: 'button', label: f('entity.menu.button') },
              ]}
            />
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
          <Form.Item
            name="path"
            label={
              menuType === 'button'
                ? f('entity.menu.permission')
                : f('entity.menu.path')
            }
          >
            <Input />
          </Form.Item>
          {menuType !== 'button' && (
            <Form.Item name="icon" label={f('entity.menu.icon')}>
              <IconPicker />
            </Form.Item>
          )}
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

export default MenuList;
