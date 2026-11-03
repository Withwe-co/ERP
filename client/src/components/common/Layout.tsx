// client/src/components/inventory/common/Layout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
  overflow: hidden;
`;

const MainContent = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.sidebarOpen ? '240px' : '60px'};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.theme.colors.background};
  position: relative;
  min-width: 0; /* 플렉스 아이템이 너무 작아지는 것을 방지 */
`;

const HeaderContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  z-index: 100;
  position: sticky;
  top: 0;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  
  /* 더 부드러운 스크롤바 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.theme.colors.gray};
    }
  }

  /* 컨텐츠 애니메이션 */
  > * {
    animation: fadeInUp 0.4s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
      />
      
      <MainContent sidebarOpen={sidebarOpen}>
        <HeaderContainer>
          <Header 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={!sidebarOpen}
          />
        </HeaderContainer>
        
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;