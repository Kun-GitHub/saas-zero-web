import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { App, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { createDict, createDictData, deleteDict, deleteDictData, getDictDataList, getDictList, updateDict, updateDictData } from '@/services/saas-zero/dict';

const DictPage: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const f = (id: string) => intl.formatMessage({ id });
  const [dicts, setDicts] = useState<SaaS.SysDict[]>([]);
  const [selectedDict, setSelectedDict] = useState<SaaS.SysDict | null>(null);
  const [dictData, setDictData] = useState<SaaS.SysDictData[]>([]);
  const [dictModal, setDictModal] = useState(false);
  const [dataModal, setDataModal] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [dictForm] = Form.useForm();
  const [dataForm] = Form.useForm();

  const loadDicts = async () => {
    const res = await getDictList({ page: 1, pageSize: 100 });
    setDicts(res.list);
  };

  const loadDictData = async (dictId: string) => {
    const res = await getDictDataList({ page: 1, pageSize: 1000, dictId });
    setDictData(res.list);
  };

  useEffect(() => { loadDicts(); }, []);

  const dictColumns = [
    { title: f('entity.dict.label'), dataIndex: 'label', key: 'label' },
    { title: f('entity.dict.value'), dataIndex: 'value', key: 'value' },
    { title: f('entity.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{f(`status.${s}`)}</Tag> },
    { title: f('entity.remark'), dataIndex: 'remark', key: 'remark' },
    {
      title: f('entity.action'), key: 'action', render: (_: any, r: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditData(r); dataForm.setFieldsValue(r); setDataModal(true); }}>{f('entity.edit')}</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: '确定删除？', onOk: async () => { await deleteDictData(r.id); message.success(f('message.deleteSuccess')); loadDictData(selectedDict!.id); } })}>{f('entity.delete')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={24}>
      <Col span={8}>
        <Card title={f('pages.dict.title')} extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); dictForm.resetFields(); setDictModal(true); }}>{f('pages.dict.create')}</Button>}>
          {dicts.map((d) => (
            <div key={d.id} onClick={async () => { setSelectedDict(d); await loadDictData(d.id); }} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: 8, background: selectedDict?.id === d.id ? '#eff6ff' : 'transparent', marginBottom: 4 }}>
              <div style={{ fontWeight: 500 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{d.key}</div>
            </div>
          ))}
        </Card>
      </Col>
      <Col span={16}>
        <Card title={`${f('pages.dict.title')} - ${selectedDict?.name || ''}`} extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditData(null); dataForm.resetFields(); setDataModal(true); }}>{f('pages.dict.data.create')}</Button>}>
          <Table rowKey="id" columns={dictColumns} dataSource={dictData} pagination={false} />
        </Card>
      </Col>
      <Modal title={f(editRecord ? 'pages.dict.edit' : 'pages.dict.create')} open={dictModal} onOk={async () => {
        const v = await dictForm.validateFields();
        if (editRecord) { await updateDict({ ...v, id: editRecord.id }); } else { await createDict(v); }
        message.success(f('message.' + (editRecord ? 'updateSuccess' : 'createSuccess'))); setDictModal(false); loadDicts();
      }} onCancel={() => setDictModal(false)}>
        <Form form={dictForm} layout="vertical">
          <Form.Item name="name" label={f('entity.dict.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="key" label={f('entity.dict.key')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'inactive', label: f('status.inactive') }]} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal title={f(editData ? 'pages.dict.data.edit' : 'pages.dict.data.create')} open={dataModal} onOk={async () => {
        const v = await dataForm.validateFields();
        const body = { ...v, dictId: selectedDict?.id };
        if (editData) { await updateDictData({ ...body, id: editData.id }); } else { await createDictData(body); }
        message.success(f('message.' + (editData ? 'updateSuccess' : 'createSuccess'))); setDataModal(false); if (selectedDict) loadDictData(selectedDict.id);
      }} onCancel={() => setDataModal(false)}>
        <Form form={dataForm} layout="vertical">
          <Form.Item name="label" label={f('entity.dict.label')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="value" label={f('entity.dict.value')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="status" label={f('entity.status')} rules={[{ required: true }]} initialValue="active">
            <Select options={[{ value: 'active', label: f('status.active') }, { value: 'inactive', label: f('status.inactive') }]} />
          </Form.Item>
          <Form.Item name="remark" label={f('entity.remark')}><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default DictPage;