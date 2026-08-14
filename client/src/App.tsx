import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles, theme } from './styles/theme';
import queryClient from './hooks/queryClient';
// Components - 실제 디렉토리 구조에 맞게 수정
import Layout from './components/common/Layout';
import DashboardPage from './components/dashboard/DashboardPage';  // pages가 아닌 components에 있음
import InventoryPage from './components/inventory/InventoryPage';
import ReceiptPage from './components/receipt/ReceiptPage';
import PurchaseRequestPage from './components/purshase/PurchaseRequestPage';  // purshase (오타) 폴더명 그대로
// import KakaoPage from './components/kakao/KakaoPage';
import UploadPage from './components/upload/UploadPage';
import StatisticsPage from './components/statistics/StatisticsPage';
import LogsPage from './components/logs/LogsPage';

// Styles
import 'react-toastify/dist/ReactToastify.css';



const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="receipts" element={<ReceiptPage />} />
                <Route path="purchase-requests" element={<PurchaseRequestPage />} />
                {/* <Route path="kakao" element={<KakaoPage />} /> */}
                <Route path="upload" element={<UploadPage />} />
                {/* <Route path="statistics" element={<StatisticsPage />} /> */}
                {/* <Route path="logs" element={<LogsPage />} /> */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
            
            {/* Toast 알림 */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
        
        {/* React Query DevTools는 프로덕션에서 제거 */}
        {/* 
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
        */}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;