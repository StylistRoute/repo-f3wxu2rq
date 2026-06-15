import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Card, Statistic, Row, Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProjectStore } from '../stores/projectStore';
import type { Project, TestCase } from '../types';

export default function ProjectsPage() {
  const {
    projects, testCases, testReports,
    addProject, updateProject, deleteProject,
  } = useProjectStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue(project);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingProject) {
        updateProject(editingProject.id, values);
      } else {
        addProject(values);
      }
      setModalOpen(false);
    });
  };

  const getProjectTestCases = (projectId: string): TestCase[] => {
    return testCases.filter((tc) => tc.projectId === projectId);
  };

  const getProjectReports = (projectId: string) => {
    return testReports.filter((tr) => tr.projectId === projectId);
  };

  const columns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '测试地址', dataIndex: 'url', key: 'url', ellipsis: true },
    {
      title: '用例数',
      key: 'cases',
      render: (_: unknown, record: Project) => (
        <Tag color="blue">{getProjectTestCases(record.id).length}</Tag>
      ),
    },
    {
      title: '报告数',
      key: 'reports',
      render: (_: unknown, record: Project) => (
        <Tag color="green">{getProjectReports(record.id).length}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: Project) => (
        <Space>
          <Button size="small" onClick={() => setDetailProject(record)}>详情</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => deleteProject(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h4>项目列表</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建项目
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="输入项目名称" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={3} placeholder="输入项目描述" />
          </Form.Item>
          <Form.Item name="url" label="测试地址" rules={[{ required: true, message: '请输入测试地址' }]}>
            <Input placeholder="https://example.com" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`项目详情 - ${detailProject?.name}`}
        open={!!detailProject}
        onCancel={() => setDetailProject(null)}
        footer={null}
        width={700}
      >
        {detailProject && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic title="测试用例" value={getProjectTestCases(detailProject.id).length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic title="测试报告" value={getProjectReports(detailProject.id).length} />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="通过率"
                    value={
                      getProjectTestCases(detailProject.id).filter((tc) => tc.status === 'passed').length
                    }
                    suffix={`/ ${getProjectTestCases(detailProject.id).length}`}
                  />
                </Card>
              </Col>
            </Row>
            <p><strong>描述：</strong>{detailProject.description}</p>
            <p><strong>测试地址：</strong>{detailProject.url}</p>
            <p><strong>创建时间：</strong>{new Date(detailProject.createdAt).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
