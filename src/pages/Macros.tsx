import { useState } from 'react';
import {
  Table, Button, Space, Popconfirm, Tag, Modal, List, Card, Timeline,
} from 'antd';
import {
  PlayCircleOutlined, DeleteOutlined, EyeOutlined,
  AimOutlined, EditOutlined, GlobalOutlined,
  ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useChatStore } from '../stores/chatStore';
import type { Macro, MacroAction } from '../types';

const actionTypeMap: Record<MacroAction['type'], { color: string; label: string }> = {
  click: { color: 'blue', label: '点击' },
  input: { color: 'green', label: '输入' },
  navigate: { color: 'purple', label: '导航' },
  scroll: { color: 'orange', label: '滚动' },
  wait: { color: 'gold', label: '等待' },
  assert: { color: 'cyan', label: '断言' },
};

export default function MacrosPage() {
  const { macros, playMacro, deleteMacro, isPlaying } = useChatStore();
  const [viewMacro, setViewMacro] = useState<Macro | null>(null);

  const columns = [
    { title: '宏名称', dataIndex: 'name', key: 'name' },
    {
      title: '步骤数',
      key: 'steps',
      render: (_: unknown, record: Macro) => (
        <Tag color="blue">{record.actions.length} 步</Tag>
      ),
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
      render: (_: unknown, record: Macro) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => playMacro(record.id)}
            loading={isPlaying}
          >
            播放
          </Button>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewMacro(record)}>
            查看
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => deleteMacro(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getActionIcon = (type: MacroAction['type']) => {
    switch (type) {
      case 'click': return <AimOutlined />;
      case 'input': return <EditOutlined />;
      case 'navigate': return <GlobalOutlined />;
      case 'wait': return <ClockCircleOutlined />;
      case 'assert': return <CheckCircleOutlined />;
      default: return <AimOutlined />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4>宏管理</h4>
        <p style={{ color: '#666', fontSize: 13 }}>
          宏是录制的操作序列，可以重复播放执行。在"AI测试执行"页面录制宏后，在此管理和回放。
        </p>
      </div>

      <Table
        columns={columns}
        dataSource={macros}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`宏详情 - ${viewMacro?.name}`}
        open={!!viewMacro}
        onCancel={() => setViewMacro(null)}
        footer={[
          <Button key="play" type="primary" icon={<PlayCircleOutlined />} onClick={() => viewMacro && playMacro(viewMacro.id)}>
            播放此宏
          </Button>,
          <Button key="close" onClick={() => setViewMacro(null)}>关闭</Button>,
        ]}
        width={600}
      >
        {viewMacro && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space>
                <Tag>共 {viewMacro.actions.length} 步</Tag>
                <Tag color="blue">关联用例: {viewMacro.testCaseId}</Tag>
              </Space>
            </Card>

            <Timeline>
              {viewMacro.actions.map((action, idx) => (
                <Timeline.Item
                  key={action.id}
                  dot={getActionIcon(action.type)}
                  color={actionTypeMap[action.type]?.color || 'blue'}
                >
                  <div>
                    <Space>
                      <Tag color={actionTypeMap[action.type]?.color}>
                        {actionTypeMap[action.type]?.label}
                      </Tag>
                      <span style={{ fontWeight: 500 }}>步骤 {idx + 1}</span>
                    </Space>
                    <p style={{ margin: '4px 0', color: '#333' }}>{action.description}</p>
                    {action.selector && (
                      <code style={{ fontSize: 12, color: '#666' }}>选择器: {action.selector}</code>
                    )}
                    {action.value && (
                      <p style={{ fontSize: 12, color: '#666' }}>值: {action.value}</p>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>

            <List
              header={<strong>操作步骤列表</strong>}
              bordered
              size="small"
              dataSource={viewMacro.actions}
              renderItem={(action, idx) => (
                <List.Item>
                  <Space>
                    <Tag>{idx + 1}</Tag>
                    <Tag color={actionTypeMap[action.type]?.color}>
                      {actionTypeMap[action.type]?.label}
                    </Tag>
                    <span>{action.description}</span>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
