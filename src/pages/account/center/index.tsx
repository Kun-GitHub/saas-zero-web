import {
  KeyOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useIntl, useLocation, useModel } from '@umijs/max';
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Tag,
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { changePassword } from '@/services/saas-zero/auth';
import { updateUser } from '@/services/saas-zero/user';

const useStyles = createStyles(({ token }) => ({
  avatarSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '32px 0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${token.colorPrimary}, #6366f1)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 32,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 600,
    color: token.colorText,
  },
  roleTags: {
    marginTop: 8,
  },
}));

const AccountCenter: React.FC = () => {
  const intl = useIntl();
  const f = (id: string) => intl.formatMessage({ id });
  const { styles } = useStyles();
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const location = useLocation();

  // Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  // Change password
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const [pwdLoading, setPwdLoading] = useState(false);

  // 从头像下拉菜单「修改密码」进入时（/account/center?action=changePassword）自动弹出弹窗
  useEffect(() => {
    // Umi 运行时 location.query 已解析为对象，但类型声明未包含，这里用断言
    const action = (location as any).query?.action;
    if (action === 'changePassword') {
      setPwdOpen(true);
    }
  }, [(location as any).query?.action]);

  const handleEditProfile = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      await updateUser({
        id: currentUser!.userId,
        username: currentUser!.userName,
        password: '',
        nickname: values.nickname,
        mobile: values.mobile || '',
        email: values.email || '',
        status: 'active',
      });
      message.success(f('message.updateSuccess'));
      setEditOpen(false);
      // Refresh user info
      if (initialState?.fetchUserInfo) {
        const updatedUser = await initialState.fetchUserInfo();
        setInitialState((prev) => ({ ...prev, currentUser: updatedUser }));
      }
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error(f('app.password.mismatch'));
        return;
      }
      setPwdLoading(true);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success(f('app.password.success'));
      setPwdOpen(false);
      pwdForm.resetFields();
    } catch (e: any) {
      if (e?.message) message.error(e.message);
    } finally {
      setPwdLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Row gutter={24}>
      <Col xs={24} md={8}>
        <Card>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <UserOutlined />
            </div>
            <div className={styles.name}>
              {currentUser.nickname || currentUser.userName}
            </div>
            <div className={styles.roleTags}>
              {currentUser.roleCodes?.map((code) => (
                <Tag key={code} color="blue">
                  {code}
                </Tag>
              ))}
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card
          title={f('account.basicInfo')}
          extra={
            <Button
              type="primary"
              onClick={() => {
                editForm.setFieldsValue({
                  nickname: currentUser.nickname,
                  mobile: currentUser.mobile,
                  email: currentUser.email,
                });
                setEditOpen(true);
              }}
            >
              {f('entity.edit')}
            </Button>
          }
        >
          <Descriptions column={1} labelStyle={{ width: 120 }}>
            <Descriptions.Item label={f('entity.username')}>
              {currentUser.userName}
            </Descriptions.Item>
            <Descriptions.Item label={f('entity.nickname')}>
              {currentUser.nickname || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={f('entity.mobile')}>
              {currentUser.mobile || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={f('entity.email')}>
              {currentUser.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={f('entity.role')}>
              {currentUser.roleCodes?.join(', ') || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={f('account.security')} style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SafetyCertificateOutlined
                style={{ fontSize: 20, color: '#10b981' }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>
                  {f('account.loginPassword')}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {f('account.loginPasswordDesc')}
                </div>
              </div>
            </div>
            <Button
              icon={<KeyOutlined />}
              onClick={() => {
                pwdForm.resetFields();
                setPwdOpen(true);
              }}
            >
              {f('app.changePassword')}
            </Button>
          </div>
        </Card>
      </Col>

      {/* Edit Profile Modal */}
      <Modal
        title={f('account.editProfile')}
        open={editOpen}
        onOk={handleEditProfile}
        onCancel={() => setEditOpen(false)}
        confirmLoading={editLoading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="nickname"
            label={f('entity.nickname')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="mobile" label={f('entity.mobile')}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={f('entity.email')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={f('app.changePassword')}
        open={pwdOpen}
        onOk={handleChangePassword}
        onCancel={() => setPwdOpen(false)}
        confirmLoading={pwdLoading}
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label={f('app.password.old')}
            rules={[{ required: true, message: f('app.password.oldRequired') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={f('app.password.new')}
            rules={[
              { required: true, message: f('app.password.newRequired') },
              { min: 6, message: f('app.password.minLength') },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={f('entity.confirmPassword')}
            rules={[
              { required: true, message: f('app.password.confirmRequired') },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default AccountCenter;
