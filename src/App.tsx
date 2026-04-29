// 導入必要的 React Router 組件與 Hooks
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// 導入自定義組件
import Header from './components/Header';
import Footer from './components/Footer';

// 導入各個頁面組件
import Home from './pages/Home';
import Explore from './pages/Explore';
import Preparation from './pages/Preparation';
import Learning from './pages/Learning';
import Login from './pages/Login';
import RouteDetail from './pages/RouteDetail';

/**
 * 頁面跳轉時自動滾動回頂部的組件
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // 當路徑名稱改變時，將視窗滾動至最上方
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * 應用程式的主入口組件，負責路由配置與整體佈局
 */
export default function App() {
  return (
    <Router basename="/mountain-search">
      {/* 確保每次換頁都回到頂部 */}
      <ScrollToTop />
      
      <div className="min-h-screen flex flex-col relative">
        {/* 背景紋理疊加層 */}
        <div className="texture-overlay" />
        
        {/* 頂部導覽列 */}
        <Header />
        
        {/* 主要內容區域 */}
        <main className="flex-grow">
          <Routes>
            {/* 首頁路由 */}
            <Route path="/" element={<Home />} />
            
            {/* 探索申請頁面 */}
            <Route path="/explore" element={<Explore />} />
            
            {/* 行前安全準備頁面 */}
            <Route path="/preparation" element={<Preparation />} />
            
            {/* 登山學堂頁面 */}
            <Route path="/learning" element={<Learning />} />
            
            {/* 登入頁面 */}
            <Route path="/login" element={<Login />} />
            
            {/* 路線詳細介紹頁面 */}
            <Route path="/route/:id" element={<RouteDetail />} />
            
            {/* 行程管理（目前導向首頁作為預留） */}
            <Route path="/management" element={<Home />} />
          </Routes>
        </main>
        
        {/* 頁尾組件 */}
        <Footer />
      </div>
    </Router>
  );
}
