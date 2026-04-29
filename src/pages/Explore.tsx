import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, ArrowRight, Users, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { routesData } from '../constants/routes';

/**
 * 探索申請頁面組件，提供路線搜尋、篩選與詳細列表展示
 */
export default function Explore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // 從 URL 參數初始化狀態，實現跨頁面搜尋傳遞
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || '全部');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '全部');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);

  // 當 URL 參數改變時同步更新狀態
  useEffect(() => {
    const q = searchParams.get('q');
    const r = searchParams.get('region');
    const l = searchParams.get('level');
    
    if (q) setSearchQuery(q);
    if (r) setSelectedRegion(r);
    if (l) setSelectedLevel(l);
  }, [searchParams]);

  // 篩選選項配置
  const regions = ['全部', '北部山區', '中部山區', '南部山區', '東部山區'];
  const levels = ['全部', '休閒級', '入門級', '挑戰級', '專家級'];

  // 使用共享的路線資料
  const routes = routesData;

  // 根據選擇的條件過濾路線
  const filteredRoutes = routes.filter(route => {
    const matchRegion = selectedRegion === '全部' || route.region === selectedRegion;
    const matchLevel = selectedLevel === '全部' || route.level === selectedLevel;
    
    // 優化搜尋邏輯：支援標題、描述、區域與等級的關鍵字搜尋
    const searchLower = searchQuery.toLowerCase().trim();
    const matchSearch = !searchLower || 
      route.title.toLowerCase().includes(searchLower) ||
      route.desc.toLowerCase().includes(searchLower) ||
      route.region.toLowerCase().includes(searchLower) ||
      route.level.toLowerCase().includes(searchLower);

    return matchRegion && matchLevel && matchSearch;
  });

  // 處理搜尋按鈕點擊（模擬載入並確保狀態更新）
  const handleSearch = () => {
    setIsSearching(true);
    // 這裡可以加入實際的 API 請求邏輯
    setTimeout(() => {
      setIsSearching(false);
      // 滾動到結果區域
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800);
  };

  return (
    <div className="flex flex-col">
      {/* 頂部搜尋與篩選面板 (Hero Section) */}
      <section className="explore-hero">
        {/* 背景大圖 */}
        <div className="explore-hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop" 
            alt="Mountain Background"
            className="explore-hero-img"
          />
          {/* 移除底部漸變，僅保留頂部微量遮罩以確保文字辨識度 */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="max-w-[1240px] mx-auto px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_5fr] gap-20 items-center">
            {/* 搜尋面板 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="search-panel"
            >
              <h2 className="search-panel-title">
                規劃您的下一座巔峰
              </h2>
              
              <div className="space-y-8">
                {/* 關鍵字搜尋 */}
                <div className="filter-group">
                  <label className="filter-label">
                    搜尋路線 SEARCH
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      type="text" 
                      placeholder="輸入山岳名稱，如：玉山..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-bg-base/50 border border-border rounded-lg outline-none focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>

                {/* 區域篩選按鈕 */}
                <div className="space-y-3">
                  <span className="filter-label block">
                    區域分佈 REGION
                  </span>
                  <div className="filter-btn-group">
                    {regions.map((region) => (
                      <button 
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={cn(
                          "filter-btn",
                          selectedRegion === region ? "filter-btn-active" : "filter-btn-inactive"
                        )}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 難度篩選按鈕 */}
                <div className="space-y-3">
                  <span className="filter-label block">
                    體能要求 LEVEL
                  </span>
                  <div className="filter-btn-group">
                    {levels.map((level) => (
                      <button 
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={cn(
                          "filter-btn",
                          selectedLevel === level ? "filter-btn-active" : "filter-btn-inactive"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12">
                <button 
                  onClick={handleSearch}
                  className="action-btn-primary"
                >
                  {isSearching ? '搜尋中...' : '立即篩選'}
                </button>
                <Link to="/management" className="action-btn-outline">
                  查看我的行程
                </Link>
              </div>
            </motion.div>

            {/* 右側標語 */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white hidden lg:block"
            >
              <p className="text-accent font-bold tracking-[0.3em] uppercase text-sm mb-6">Explore the Wilderness</p>
              <h1 className="text-6xl font-serif font-bold leading-tight mb-8">
                與山共鳴，<br />
                開啟您的冒險篇章
              </h1>
              <p className="text-lg opacity-80 max-w-[450px] leading-relaxed tracking-wide">
                我們提供最精準的地形圖資與社群經驗分享，讓您的每一次登頂都充滿信心與安全。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 搜尋結果展示區 (Results Section) */}
      <section id="results-section" className="py-20 md:py-40 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 md:px-8">
          {/* 結果標題與統計 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-8">
            <div>
              <h2 className="font-serif text-4xl md:text-[2.8rem] font-bold text-primary tracking-tight mb-4">熱門推薦路線</h2>
              <p className="text-text-muted text-base md:text-lg tracking-wide">根據您的篩選條件，我們為您精選了以下挑戰</p>
            </div>
            <div className="flex items-center gap-4 text-primary font-bold tracking-widest uppercase text-sm border-b-2 border-primary pb-2">
              <Filter size={16} />
              共 {filteredRoutes.length} 條符合路線
            </div>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-start">
            {/* 左側：精選路線大卡片 */}
            <div className="w-full lg:sticky lg:top-32 z-10 bg-white relative">
              {filteredRoutes.length > 0 ? (
                <div className="group">
                  <div className="relative overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(27,43,35,0.08)] aspect-[4/3]">
                    <img 
                      src={filteredRoutes[0].img} 
                      className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                      alt={filteredRoutes[0].title}
                    />
                    <div className="absolute top-6 left-6 bg-accent text-white px-5 py-2 text-[0.75rem] font-bold tracking-widest uppercase rounded-sm">
                      本日精選
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-accent font-bold tracking-widest uppercase text-sm">{filteredRoutes[0].region}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span className="text-primary font-bold tracking-widest uppercase text-sm">{filteredRoutes[0].level}</span>
                    </div>
                    <h3 className="font-serif text-3xl md:text-[3.2rem] font-bold text-primary tracking-tight leading-none mb-6">
                      {filteredRoutes[0].title}
                    </h3>
                    <p className="text-text-muted text-xl leading-relaxed mb-10 max-w-[500px]">
                      {filteredRoutes[0].desc}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
                      <div className="flex flex-col">
                        <span className="text-[0.7rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40 mb-1">登頂人數</span>
                        <span className="text-2xl font-bold text-primary">{filteredRoutes[0].count} <span className="text-sm font-normal">山友</span></span>
                      </div>
                      <Link 
                        to={`/route/${filteredRoutes[0].id}`}
                        className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-sm font-bold tracking-widest uppercase hover:bg-accent transition-all flex items-center justify-center gap-3"
                      >
                        查看攻略 <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // 無結果時的顯示
                <div className="bg-bg-base p-20 rounded-lg text-center border-2 border-dashed border-border">
                  <Search size={48} className="mx-auto text-border mb-6" />
                  <h3 className="text-2xl font-serif text-primary mb-2">找不到符合的路線</h3>
                  <p className="text-text-muted">請嘗試調整篩選條件或關鍵字</p>
                </div>
              )}
            </div>

            {/* 右側：路線列表 */}
            <div className="w-full relative z-0">
              {/* 表頭 - 僅在桌面版顯示 */}
              <div className="hidden md:flex border-b-2 border-primary pb-6 mb-4">
                <div className="flex-1 text-[0.75rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40">路線名稱</div>
                <div className="w-32 text-right text-[0.75rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40">熱度</div>
              </div>

              <div className="divide-y divide-border">
                {filteredRoutes.slice(1).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/route/${item.id}`)}
                    className="py-8 group cursor-pointer hover:bg-bg-base/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center">
                      <span className="w-10 h-10 bg-bg-base text-primary inline-flex items-center justify-center rounded-sm text-[0.9rem] mr-4 md:mr-6 font-extrabold border border-border group-hover:bg-primary group-hover:text-white transition-colors flex-none">
                        {item.id}
                      </span>
                      <div>
                        <span className="text-xl md:text-2xl font-bold text-primary font-serif group-hover:text-accent transition-colors block mb-1">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-3 text-[0.7rem] font-bold text-text-muted uppercase tracking-widest">
                          <span>{item.region}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{item.level}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center md:w-32 flex-none">
                      <span className="text-accent font-extrabold text-base md:text-lg">
                        {item.count} 登頂
                      </span>
                      <Link 
                        to={`/route/${item.id}`}
                        className="text-[0.65rem] font-extrabold text-primary uppercase tracking-widest md:opacity-0 group-hover:opacity-100 transition-opacity mt-0 md:mt-2 flex items-center gap-1"
                      >
                        查看攻略 <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
                
                {/* 列表結尾提示 */}
                {filteredRoutes.length <= 1 && filteredRoutes.length > 0 && (
                  <div className="py-20 text-center text-text-muted italic">
                    沒有更多推薦路線了，請嘗試放寬篩選條件
                  </div>
                )}
              </div>

              {/* 統計數據卡片 */}
              <div className="grid grid-cols-2 gap-6 mt-20">
                <div className="bg-bg-base p-8 rounded-lg border border-border">
                  <Users className="text-accent mb-4" size={24} />
                  <h4 className="text-3xl font-bold text-primary mb-1">12.5k</h4>
                  <p className="text-[0.7rem] font-extrabold text-primary uppercase tracking-widest opacity-40">本月活躍山友</p>
                </div>
                <div className="bg-bg-base p-8 rounded-lg border border-border">
                  <Calendar className="text-accent mb-4" size={24} />
                  <h4 className="text-3xl font-bold text-primary mb-1">85%</h4>
                  <p className="text-[0.7rem] font-extrabold text-primary uppercase tracking-widest opacity-40">平均中籤機率</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
