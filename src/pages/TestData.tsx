import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, Select, Tag, Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTestDataStore } from '../stores/testDataStore';
import { useProjectStore } from '../stores/projectStore';
import type { TestData } from '../types';

export default function TestDataPage() {
  const { testDataSets, addTestData, updateTestData, deleteTestData } = useTestDataStore();
  const { projects } = useProjectStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<TestData | null>(null);
  const [viewingData, setViewingData] = useState<TestData | null>(null);
  const [form] = Form.useForm();
  const [dataRows, setDataRows] = useState<string>('');

  const handleAdd = () => {
    setEditingData(null);
    form.resetFields();
    setDataRows('');
    setModalOpen(true);
  };

  const handleEdit = (data: TestData) => {
    setEditingData(data);
    form.setFieldsValue({ ...data });
    setDataRows(JSON.stringify(data.data, null, 2));
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      let parsedData: Record<string, string>[] = [];
      try {
        parsedData = JSON.parse(dataRows);
      } catch {
        parsedData = [];
      }
      const saveData = { ...values, data: parsedData };
      if (editingData) {
        updateTestData(editingData.id, saveData);
      } else {
        addTestData(saveData);
      }
      setModalOpen(false);
    });
  };

  const columns = [
    { title: '数据集名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '所属项目',
      key: 'project',
      render: (_: unknown, record: TestData) => {
        const project = projects.find((p) => p.id === record.projectId);
        return <Tag color="blue">{project?.name || '未知'}</Tag>;
      },
    },
    {
      title: '数据条数',
      key: 'count',
      render: (_: unknown, record: TestData) => <Tag>{record.data.length} 条</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: TestData) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewingData(record); setViewModalOpen(true); }} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => deleteTestData(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h4>测试数据管理</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建数据集
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={testDataSets}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingData ? '编辑数据集' : '新建数据集'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择项目' }]}>
            <Select placeholder="选择项目">
              {projects.map((p) => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="数据集名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="输入数据集名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="输入描述" />
          </Form.Item>
          <Form.Item label="测试数据（JSON数组格式）" required>
            <Input.TextArea
              rows={8}
              value={dataRows}
              onChange={(e) => setDataRows(e.target.value)}
              placeholder={'[\n  {"field1": "value1", "field2": "value2"},\n  {"field1": "value3", "field2": "value4"}\n]'}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`数据集详情 - ${viewingData?.name}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={800}
      >
        {viewingData && (
          <div>
            <p><strong>描述：</strong>{viewingData.description}</p>
            <Card style={{ marginTop: 16 }}>
              {viewingData.data.length > 0 && (
                <Table
                  dataSource={viewingData.data.map((row, idx) => ({ ...row, _key: idx }))}
                  rowKey="_key"
                  columns={Object.keys(viewingData.data[0]).map((key) => ({
                    title: key,
                    dataIndex: key,
                    key,
                  }))}
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
