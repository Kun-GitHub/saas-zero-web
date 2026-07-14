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
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {
  createPackage,
  deletePackage,
  getPackageList,
  updatePackage,
} from '@/services/saas-zero/package';

const PackageList: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const f = (id: string) => intl.formatMessage({ id });
  const [packages, setPackages] = useState<SaaS.SysPackage[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const load = async () => {
    const res = await getPackageList({ page: 1, pageSize: 100 });
    setPackages(res.list);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
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
      </div>
      <Row gutter={[24, 24]}>
        {packages.map((pkg) => (
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
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <Button
                  style={{ flex: 1 }}
                  onClick={() => {
                    setEditRecord(pkg);
                    form.setFieldsValue(pkg);
                    setModalOpen(true);
                  }}
                >
                  {f('entity.edit')}
                </Button>
                <Button
                  style={{ flex: 1 }}
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    Modal.confirm({
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
    </div>
  );
};

export default PackageList;
