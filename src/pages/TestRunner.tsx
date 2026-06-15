import { useState, useRef, useEffect } from 'react';
import {
  Input, Button, Card, Space, Tag, List, Avatar, Tooltip, Badge, Select, Alert,
} from 'antd';
import {
  SendOutlined, RobotOutlined, UserOutlined, GlobalOutlined,
  VideoCameraOutlined, PauseCircleOutlined, ReloadOutlined,
  AimOutlined, EditOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons';
import { useChatStore } from '../stores/chatStore';
import { useProjectStore } from '../stores/projectStore';
import type { MacroAction } from '../types';

export default function TestRunnerPage() {
  const {
    messages, isRecording, isPlaying, browserUrl, currentMacro,
    addMessage, startRecording, stopRecording, addMacroAction,
    setBrowserUrl, playMacro, macros,
  } = useChatStore();
  const { projects, testCases } = useProjectStore();
  const [inputValue, setInputValue] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [urlInput, setUrlInput] = useState(browserUrl);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('打开') || lowerMsg.includes('导航') || lowerMsg.includes('访问')) {
      const urlMatch = userMessage.match(/(?:https?:\/\/[^\s]+|\/[^\s]*)/);
      if (urlMatch) {
        setBrowserUrl(urlMatch[0]);
        setUrlInput(urlMatch[0]);
        return `好的，正在打开 ${urlMatch[0]}...页面已加载完成。`;
      }
      return '请告诉我要打开哪个网址，例如："打开 https://example.com"';
    }
    if (lowerMsg.includes('点击') || lowerMsg.includes('按钮')) {
      const target = userMessage.replace(/点击|按|按钮/g, '').trim();
      return `已点击 "${target}"。操作完成，页面已更新。`;
    }
    if (lowerMsg.includes('输入') || lowerMsg.includes('填写') || lowerMsg.includes('写入')) {
      return `已完成输入操作。`;
    }
    if (lowerMsg.includes('截图') || lowerMsg.includes('screenshot')) {
      return '已截取当前页面截图并保存。';
    }
    if (lowerMsg.includes('验证') || lowerMsg.includes('检查') || lowerMsg.includes('断言')) {
      return '验证通过！页面元素符合预期。';
    }
    return `收到指令："${userMessage}"。AI正在分析并执行操作...操作已完成。`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    addMessage({ role: 'user', content: inputValue });

    if (isRecording) {
      const action: Omit<MacroAction, 'id' | 'timestamp'> = {
        type: 'click',
        description: inputValue,
      };
      if (inputValue.includes('打开') || inputValue.includes('导航')) {
        action.type = 'navigate';
        const urlMatch = inputValue.match(/(?:https?:\/\/[^\s]+|\/[^\s]*)/);
        if (urlMatch) action.value = urlMatch[0];
      } else if (inputValue.includes('输入') || inputValue.includes('填写')) {
        action.type = 'input';
      } else if (inputValue.includes('等待')) {
        action.type = 'wait';
      } else if (inputValue.includes('验证') || inputValue.includes('断言')) {
        action.type = 'assert';
      }
      addMacroAction(action);
    }

    setTimeout(() => {
      const response = simulateAIResponse(inputValue);
      addMessage({ role: 'assistant', content: response });
    }, 800);

    setInputValue('');
  };

  const handleNavigate = () => {
    let url = urlInput;
    if (!url.startsWith('http')) url = 'https://' + url;
    setBrowserUrl(url);
    addMessage({ role: 'system', content: `已导航至: ${url}` });
  };

  const handleStartRecording = () => {
    startRecording();
    addMessage({ role: 'system', content: '开始录制宏...所有操作将被记录。' });
  };

  const handleStopRecording = () => {
    const testCase = testCases.find((tc) => tc.projectId === selectedProject);
    stopRecording(testCase?.id || 'unknown', `录制_${new Date().toLocaleTimeString()}`);
    addMessage({ role: 'system', content: `录制完成！已保存 ${currentMacro.length} 个操作步骤为宏。` });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 16 }}>
      {/* Left: Browser View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card
          size="small"
          style={{ marginBottom: 8 }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <Space style={{ width: '100%' }}>
            <Button size="small" icon={<LeftOutlined />} />
            <Button size="small" icon={<RightOutlined />} />
            <Button size="small" icon={<ReloadOutlined />} onClick={handleNavigate} />
            <Input
              size="small"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onPressEnter={handleNavigate}
              prefix={<GlobalOutlined />}
              style={{ flex: 1 }}
              placeholder="输入网址..."
            />
            <Tooltip title="元素选择器">
              <Button size="small" icon={<AimOutlined />} />
            </Tooltip>
          </Space>
        </Card>

        <Card
          style={{ flex: 1, overflow: 'hidden' }}
          bodyStyle={{ height: '100%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}
        >
          {browserUrl === 'about:blank' ? (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <GlobalOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <p>内嵌浏览器</p>
              <p style={{ fontSize: 12 }}>请在地址栏输入网址或通过对话操作导航</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <GlobalOutlined style={{ fontSize: 36, color: '#1677ff', marginBottom: 8 }} />
              <p style={{ fontWeight: 500 }}>{browserUrl}</p>
              <p style={{ fontSize: 12, color: '#999' }}>页面内容区域（Electron模式下将显示真实网页）</p>
              <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8, width: '80%' }}>
                <p style={{ fontSize: 12, color: '#666' }}>模拟页面渲染区...</p>
                <div style={{ marginTop: 8, padding: 8, background: '#fff', borderRadius: 4, border: '1px solid #d9d9d9' }}>
                  <Input placeholder="用户名" style={{ marginBottom: 8 }} />
                  <Input.Password placeholder="密码" style={{ marginBottom: 8 }} />
                  <Button type="primary" block>登录</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Right: Chat Panel */}
      <div style={{ width: 400, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Card size="small" bodyStyle={{ padding: '8px 12px' }} style={{ marginBottom: 8 }}>
          <Space wrap>
            <Select
              size="small"
              placeholder="选择项目"
              value={selectedProject || undefined}
              onChange={setSelectedProject}
              style={{ width: 120 }}
            >
              {projects.map((p) => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
            {!isRecording ? (
              <Button
                size="small"
                type="primary"
                danger
                icon={<VideoCameraOutlined />}
                onClick={handleStartRecording}
              >
                录制宏
              </Button>
            ) : (
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={handleStopRecording}
              >
                停止录制
              </Button>
            )}
            {macros.length > 0 && (
              <Select
                size="small"
                placeholder="播放宏"
                style={{ width: 110 }}
                onChange={(id) => playMacro(id)}
              >
                {macros.map((m) => (
                  <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
                ))}
              </Select>
            )}
          </Space>
        </Card>

        {isRecording && (
          <Alert
            message={`正在录制... 已记录 ${currentMacro.length} 个操作`}
            type="error"
            showIcon
            icon={<VideoCameraOutlined />}
            style={{ marginBottom: 8 }}
          />
        )}

        {isPlaying && (
          <Alert
            message="正在回放宏..."
            type="info"
            showIcon
            icon={<RobotOutlined />}
            style={{ marginBottom: 8 }}
          />
        )}

        {/* Messages */}
        <Card
          style={{ flex: 1, overflow: 'hidden' }}
          bodyStyle={{ height: '100%', overflow: 'auto', padding: 12 }}
        >
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item style={{ border: 'none', padding: '4px 0' }}>
                <div style={{
                  display: 'flex',
                  gap: 8,
                  width: '100%',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}>
                  <Avatar
                    size="small"
                    icon={msg.role === 'user' ? <UserOutlined /> : msg.role === 'assistant' ? <RobotOutlined /> : <EditOutlined />}
                    style={{
                      backgroundColor: msg.role === 'user' ? '#1677ff' : msg.role === 'assistant' ? '#52c41a' : '#faad14',
                    }}
                  />
                  <div style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: msg.role === 'user' ? '#1677ff' : '#f5f5f5',
                    color: msg.role === 'user' ? '#fff' : '#333',
                    fontSize: 13,
                  }}>
                    {msg.content}
                    {msg.action && (
                      <Tag color="orange" style={{ marginTop: 4, display: 'block' }}>
                        {msg.action.type}: {msg.action.description}
                      </Tag>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </Card>

        {/* Input */}
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Badge dot={isRecording} offset={[-5, 5]}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              placeholder="用大白话说出你要测试的操作..."
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                />
              }
            />
          </Badge>
        </div>
      </div>
    </div>
  );
}
