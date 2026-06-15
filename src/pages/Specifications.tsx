import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, Select, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useSpecStore } from '../stores/specStore';
import { useProjectStore } from '../stores/projectStore';
import type { Specification } from '../types';

export default function SpecificationsPage() {
  const { specifications, addSpecification, updateSpecification, deleteSpecification } = useSpecStore();
  const { projects } = useProjectStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);
  const [viewingSpec, setViewingSpec] = useState<Specification | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingSpec(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (spec: Specification) => {
    setEditingSpec(spec);
    form.setFieldsValue(spec);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingSpec) {
        updateSpecification(editingSpec.id, values);
      } else {
        addSpecification(values);
      }
      setModalOpen(false);
    });
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '所属项目',
      key: 'project',
      render: (_: unknown, record: Specification) => {
        const project = projects.find((p) => p.id === record.projectId);
        return <Tag color="blue">{project?.name || '未知'}</Tag>;
      },
    },
    { title: '版本', dataIndex: 'version', key: 'version' },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: Specification) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewingSpec(record); setViewModalOpen(true); }} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => deleteSpecification(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h4>功能说明书</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建说明书
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={specifications}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSpec ? '编辑说明书' : '新建说明书'}
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
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="输入功能说明书标题" />
          </Form.Item>
          <Form.Item name="version" label="版本号" rules={[{ required: true, message: '请输入版本号' }]}>
            <Input placeholder="例如 1.0" />
          </Form.Item>
          <Form.Item name="content" label="内容（支持Markdown）" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={12} placeholder="输入功能说明书内容，支持 Markdown 格式" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={viewingSpec?.title}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={700}
      >
        {viewingSpec && (
          <div>
            <p><strong>版本：</strong>{viewingSpec.version}</p>
            <p><strong>更新时间：</strong>{new Date(viewingSpec.updatedAt).toLocaleString()}</p>
            <div style={{
              marginTop: 16,
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 8,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: 13,
            }}>
              {viewingSpec.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
