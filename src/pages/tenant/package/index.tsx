import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tree,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { getApiList } from '@/services/saas-zero/api';
import { getMenuTree } from '@/services/saas-zero/menu';
import {
  assignPackageApis,
  assignPackageMenus,
  createPackage,
  deletePackage,
  getPackageDetail,
  getPackageList,
  updatePackage,
} from '@/services/saas-zero/package';
import { formatDateTime } from '@/utils/datetime';
import { usePermission } from '@/utils/permission';

// 把平铺的 API 列表组织成 目录(group) + 接口(api) 两级树
const buildApiTree = (apis: SaaS.SysApi[]): any[] => {
  const groups = apis.filter((a) => a.apiType === 'group');
  const items = apis.filter((a) => a.apiType === 'api');
  return groups
    .map((g) => ({
      ...g,
      children: items.filter((i) => i.apiPath.startsWith(`${g.apiPath}/`)),
    }))
    .filter((g) => g.children.length > 0);
};

const PackageList: React.FC = () => {
  const intl = useIntl();
  const { message, modal } = App.useApp();
  const { can } = usePermission();
  const f = (id: string) => intl.formatMessage({ id });
  const [packages, setPackages] = useState<SaaS.SysPackage[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  // 分配菜单
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [pkgForMenu, setPkgForMenu] = useState<SaaS.SysPackage | null>(null);
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [checkedMenuKeys, setCheckedMenuKeys] = useState<React.Key[]>([]);

  // 分配 API
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [pkgForApi, setPkgForApi] = useState<SaaS.SysPackage | null>(null);
  const [apiTree, setApiTree] = useState<any[]>([]);
  const [checkedApiKeys, setCheckedApiKeys] = useState<React.Key[]>([]);

  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | undefined>();

  const filteredPackages = packages.filter(
    (p) =>
      (!searchName ||
        p.name.includes(searchName) ||
        p.code.includes(searchName)) &&
      (!searchStatus || p.status === searchStatus),
  );

  const load = async () => {
    const res = await getPackageList({ page: 1, pageSize: 100 });
    setPackages(res.list);
  };

  useEffect(() => {
    load();
  }, []);

  // 分配菜单：加载套餐已关联的菜单 + 全量菜单树，回显勾选
  const openMenuModal = async (pkg: SaaS.SysPackage) => {
    setPkgForMenu(pkg);
    setCheckedMenuKeys([]);
    const [detail, tree] = await Promise.all([
      getPackageDetail(pkg.idStr!).catch(() => undefined),
      getMenuTree().catch(() => []),
    ]);
    setMenuTree(tree || []);
    setCheckedMenuKeys((detail?.menuIds as string[]) || []);
    setMenuModalOpen(true);
  };

  const handleMenuOk = async () => {
    if (!pkgForMenu) return;
    await assignPackageMenus({
      id: pkgForMenu.idStr!,
      menuIds: checkedMenuKeys as string[],
    });
    message.success(f('message.assignSuccess'));
    setMenuModalOpen(false);
  };

  // 分配 API：加载套餐已关联的 API + 全量 API 树，回显勾选
  const openApiModal = async (pkg: SaaS.SysPackage) => {
    setPkgForApi(pkg);
    setCheckedApiKeys([]);
    const [detail, res] = await Promise.all([
      getPackageDetail(pkg.idStr!).catch(() => undefined),
      getApiList({ page: 1, pageSize: 100 }).catch(() => ({ list: [] })),
    ]);
    setApiTree(buildApiTree(res.list || []));
    setCheckedApiKeys((detail?.apiIds as string[]) || []);
    setApiModalOpen(true);
  };

  const handleApiOk = async () => {
    if (!pkgForApi) return;
    await assignPackageApis({
      id: pkgForApi.idStr!,
      apiIds: checkedApiKeys as string[],
    });
    message.success(f('message.assignSuccess'));
    setApiModalOpen(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input.Search
          allowClear
          placeholder={f('pages.tenant.package.search')}
          style={{ width: 260 }}
          onSearch={(v) => setSearchName(v.trim())}
        />
        <Select
          allowClear
          placeholder={f('entity.status')}
          style={{ width: 140 }}
          value={searchStatus}
          onChange={setSearchStatus}
          options={[
            { value: 'active', label: f('status.active') },
            { value: 'inactive', label: f('status.inactive') },
          ]}
        />
        <div style={{ flex: 1 }} />
      </div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        {can('system:package:create') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRecord(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            {f('pages.tenant.package.create')}
          </Button>
        )}
      </div>
      <Row gutter={[24, 24]}>
        {filteredPackages.map((pkg) => (
          <Col xs={24} sm={12} lg={8} key={pkg.idStr}>
            <Card>
              <Tag color="blue" style={{ marginBottom: 8 }}>
                {pkg.code}
              </Tag>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0 }}>{pkg.name}</h3>
                <Tag color="green">
                  {pkg.status === 'active'
                    ? f('status.active')
                    : f('status.inactive')}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                {f('entity.updatedAt')}: {formatDateTime(pkg.updatedAt)} ·{' '}
                {f('entity.updatedBy')}: {pkg.updatedBy || '-'}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                {can('system:package:assignMenus') && (
                  <Button onClick={() => openMenuModal(pkg)}>
                    {f('pages.tenant.package.assignMenus')}
                  </Button>
                )}
                {can('system:package:assignApis') && (
                  <Button onClick={() => openApiModal(pkg)}>
                    {f('pages.tenant.package.assignApis')}
                  </Button>
                )}
                {can('system:package:update') && (
                  <Button
                    onClick={() => {
                      setEditRecord(pkg);
                      form.setFieldsValue(pkg);
                      setModalOpen(true);
                    }}
                  >
                    {f('entity.edit')}
                  </Button>
                )}
                {can('system:package:delete') && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      modal.confirm({
                        title: f('pages.tenant.package.deleteConfirm'),
                        onOk: async () => {
                          await deletePackage([pkg.idStr!]);
                          message.success(f('message.deleteSuccess'));
                          load();
                        },
                      })
                    }
                  >
                    {f('entity.delete')}
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        title={f(
          editRecord
            ? 'pages.tenant.package.edit'
            : 'pages.tenant.package.create',
        )}
        open={modalOpen}
        onOk={async () => {
          const values = await form.validateFields();
          if (editRecord) {
            await updatePackage({ ...values, id: editRecord.idStr });
          } else {
            await createPackage(values);
          }
          message.success(
            f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess')),
          );
          setModalOpen(false);
          load();
        }}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={f('entity.package.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={f('entity.package.code')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sort"
            label={f('entity.sort')}
            rules={[{ required: true, message: f('validation.sortRequired') }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label={f('entity.remark')}>
            <Input.TextArea />
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
          f('pages.tenant.package.assignMenus') +
          (pkgForMenu ? ` - ${pkgForMenu.name}` : '')
        }
        open={menuModalOpen}
        onOk={handleMenuOk}
        onCancel={() => setMenuModalOpen(false)}
        width={500}
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <Tree
            checkable
            treeData={menuTree}
            fieldNames={{ title: 'name', key: 'idStr', children: 'children' }}
            checkedKeys={checkedMenuKeys}
            onCheck={(keys) => setCheckedMenuKeys(keys as React.Key[])}
            defaultExpandAll
          />
        </div>
      </Modal>
      <Modal
        title={
          f('pages.tenant.package.assignApis') +
          (pkgForApi ? ` - ${pkgForApi.name}` : '')
        }
        open={apiModalOpen}
        onOk={handleApiOk}
        onCancel={() => setApiModalOpen(false)}
        width={600}
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <Tree
            checkable
            treeData={apiTree}
            fieldNames={{
              title: 'apiName',
              key: 'idStr',
              children: 'children',
            }}
            checkedKeys={checkedApiKeys}
            onCheck={(keys) => setCheckedApiKeys(keys as React.Key[])}
            defaultExpandAll
          />
        </div>
      </Modal>
    </div>
  );
};

export default PackageList;
