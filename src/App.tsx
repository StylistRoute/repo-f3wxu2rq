import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  ProjectOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import ProjectsPage from './pages/Projects';
import SpecificationsPage from './pages/Specifications';
import TestDataPage from './pages/TestData';
import TestRunnerPage from './pages/TestRunner';
import MacrosPage from './pages/Macros';
import ReportsPage from './pages/Reports';

const { Header, Sider, Content } = Layout;

type PageKey = 'projects' | 'specifications' | 'testdata' | 'runner' | 'macros' | 'reports';

const menuItems = [
  { key: 'projects', icon: <ProjectOutlined />, label: '项目管理' },
  { key: 'specifications', icon: <FileTextOutlined />, label: '功能说明书' },
  { key: 'testdata', icon: <DatabaseOutlined />, label: '测试数据' },
  { key: 'runner', icon: <RobotOutlined />, label: 'AI测试执行' },
  { key: 'macros', icon: <PlayCircleOutlined />, label: '宏管理' },
  { key: 'reports', icon: <BarChartOutlined />, label: '测试报告' },
];

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('projects');
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const renderPage = () => {
    switch (currentPage) {
      case 'projects':
        return <ProjectsPage />;
      case 'specifications':
        return <SpecificationsPage />;
      case 'testdata':
        return <TestDataPage />;
      case 'runner':
        return <TestRunnerPage />;
      case 'macros':
        return <MacrosPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <ProjectsPage />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: token.colorBgContainer }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <h2 style={{
            margin: 0,
            fontSize: collapsed ? 14 : 16,
            fontWeight: 700,
            color: token.colorPrimary,
            whiteSpace: 'nowrap',
          }}>
            {collapsed ? 'AI' : 'AI 测试工具'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key as PageKey)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, color: token.colorText }}>
            {menuItems.find((item) => item.key === currentPage)?.label}
          </h3>
        </Header>
        <Content style={{
          margin: 16,
          padding: 24,
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          overflow: 'auto',
        }}>
          {renderPage()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
