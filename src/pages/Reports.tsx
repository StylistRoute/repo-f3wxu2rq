import { useState } from 'react';
import {
  Table, Button, Space, Tag, Modal, Card, Row, Col, Statistic, Progress, Empty,
  Popconfirm,
} from 'antd';
import {
  BarChartOutlined, DeleteOutlined, EyeOutlined, PlusOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { useProjectStore } from '../stores/projectStore';
import type { TestReport, TestResult } from '../types';

export default function ReportsPage() {
  const { testReports, testCases, projects, addTestReport, deleteTestReport } = useProjectStore();
  const [viewReport, setViewReport] = useState<TestReport | null>(null);

  const handleGenerateReport = () => {
    if (testCases.length === 0) return;

    const results: TestResult[] = testCases.map((tc) => ({
      testCaseId: tc.id,
      testCaseName: tc.name,
      status: Math.random() > 0.3 ? 'passed' : 'failed',
      duration: Math.floor(Math.random() * 5000) + 500,
      screenshots: [],
      steps: tc.steps.map((step) => ({
        stepId: step.id,
        description: step.description,
        status: Math.random() > 0.2 ? 'passed' : 'failed',
      })),
    }));

    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const total = results.length;

    addTestReport({
      projectId: testCases[0].projectId,
      name: `测试报告 ${new Date().toLocaleDateString()}`,
      testCaseIds: testCases.map((tc) => tc.id),
      results,
      summary: {
        total,
        passed,
        failed,
        skipped: 0,
        duration: results.reduce((sum, r) => sum + r.duration, 0),
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      },
    });
  };

  const columns = [
    { title: '报告名称', dataIndex: 'name', key: 'name' },
    {
      title: '项目',
      key: 'project',
      render: (_: unknown, record: TestReport) => {
        const project = projects.find((p) => p.id === record.projectId);
        return <Tag color="blue">{project?.name || '未知'}</Tag>;
      },
    },
    {
      title: '通过率',
      key: 'passRate',
      render: (_: unknown, record: TestReport) => (
        <Progress
          percent={record.summary.passRate}
          size="small"
          status={record.summary.passRate === 100 ? 'success' : record.summary.passRate < 50 ? 'exception' : 'normal'}
        />
      ),
    },
    {
      title: '用例数',
      key: 'total',
      render: (_: unknown, record: TestReport) => (
        <Space>
          <Tag color="green">{record.summary.passed} 通过</Tag>
          <Tag color="red">{record.summary.failed} 失败</Tag>
        </Space>
      ),
    },
    {
      title: '耗时',
      key: 'duration',
      render: (_: unknown, record: TestReport) => `${(record.summary.duration / 1000).toFixed(1)}s`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: TestReport) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewReport(record)}>详情</Button>
          <Popconfirm title="确认删除？" onConfirm={() => deleteTestReport(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h4>测试报告</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleGenerateReport}>
          生成测试报告
        </Button>
      </div>

      {testReports.length === 0 ? (
        <Empty description="暂无测试报告，点击上方按钮生成" />
      ) : (
        <Table
          columns={columns}
          dataSource={testReports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={<Space><BarChartOutlined />{viewReport?.name}</Space>}
        open={!!viewReport}
        onCancel={() => setViewReport(null)}
        footer={null}
        width={800}
      >
        {viewReport && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="总用例数" value={viewReport.summary.total} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="通过"
                    value={viewReport.summary.passed}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="失败"
                    value={viewReport.summary.failed}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="通过率"
                    value={viewReport.summary.passRate}
                    suffix="%"
                    prefix={<MinusCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="用例执行详情" size="small">
              <Table
                dataSource={viewReport.results}
                rowKey="testCaseId"
                pagination={false}
                size="small"
                columns={[
                  { title: '用例名称', dataIndex: 'testCaseName', key: 'name' },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'passed' ? 'green' : status === 'failed' ? 'red' : 'default'}>
                        {status === 'passed' ? '通过' : status === 'failed' ? '失败' : '跳过'}
                      </Tag>
                    ),
                  },
                  {
                    title: '耗时',
                    dataIndex: 'duration',
                    key: 'duration',
                    render: (d: number) => `${(d / 1000).toFixed(2)}s`,
                  },
                  {
                    title: '步骤详情',
                    key: 'steps',
                    render: (_: unknown, record: TestResult) => (
                      <Space>
                        <Tag color="green">{record.steps.filter((s) => s.status === 'passed').length} 通过</Tag>
                        <Tag color="red">{record.steps.filter((s) => s.status === 'failed').length} 失败</Tag>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
