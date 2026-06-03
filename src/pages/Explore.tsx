import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ArrowRight, Calendar, Mountain, Cloud, Sun, CloudRain, Droplets, Wind, Thermometer } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { routesData } from '../constants/routes';
import { findPeakByName } from '../constants/taiwan100Peaks';
import { MountainService } from '../services/mountainService';

// 台灣百岳官方清單（依編號排序）
const TAIWAN_100_PEAKS = [
  '玉山', '雪山', '玉山東峰', '玉山南峰', '玉山北峰', '秀姑巒山', '馬博拉斯山', '南湖大山', '東小南山', '中央尖山',
  '雪山北峰', '關山', '大水窟山', '南湖大山東峰', '東郡大山', '奇萊北峰', '向陽山', '大劍山', '雲峰', '奇萊主山',
  '馬利加南山', '南湖北山', '大雪山', '品田山', '玉山西峰', '頭鷹山', '南湖大山南峰', '三叉山', '大霸尖山', '東巒大山',
  '無明山', '巴巴山', '馬西山', '北合歡山', '合歡山東峰', '小霸尖山', '合歡山', '南玉山', '畢祿山', '卓社大山',
  '奇萊南峰', '南雙頭山', '能高山南峰', '白姑大山', '新康山', '八通關山', '丹大山', '桃山', '佳陽山', '火石山',
  '池有山', '伊澤山', '卑南主山', '志佳陽大山', '太魯閣大山', '干卓萬山', '轆轆山', '郡大山', '喀西帕南山', '內嶺爾山',
  '鈴鳴山', '能高山', '萬東山西峰', '劍山', '義西請馬至山', '小關山', '屏風山', '無雙山', '牧山', '石門山',
  '玉山前峰', '塔關山', '馬比杉山', '達芬尖山', '雪山東峰', '南華山', '關山嶺山', '海諾南山', '中雪山', '閂山',
  '甘薯峰', '西合歡山', '審馬陣山', '喀拉業山', '庫哈諾辛山', '加利山', '白石山', '磐石山', '帕托魯山', '北大武山',
  '西巒大山', '立霧主山', '塔芬山', '光頭山', '安東軍山', '羊頭山', '駒盆山', '布拉克桑山', '六順山', '鹿山',
];

// routesData 中不在百岳列表的路線（古道、瀑布、湖泊、小百岳等）
const OTHER_ROUTE_OPTIONS = Array.from(new Set(
  routesData
    .map(r => r.title)
    .filter(title => !TAIWAN_100_PEAKS.some(p => title.includes(p)))
));

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

  // 百岳即時資料：座標 + 天氣（給 routesData 沒收錄的百岳用）
  const [peakLive, setPeakLive] = useState<{
    name: string;
    lat: number | null;
    lng: number | null;
    weather: { temp: number; feel: number; status: string; rain: number; wind: number; humidity: number; code: number } | null;
    isLoading: boolean;
  } | null>(null);

  useEffect(() => {
    const peak = findPeakByName(searchQuery);
    if (!peak) {
      setPeakLive(null);
      return;
    }
    // 先從 routesData 找對應座標
    const matched = routesData.find(r => r.title.includes(peak.name) && r.lat !== undefined && r.lng !== undefined);
    let cancelled = false;
    setPeakLive({ name: peak.name, lat: null, lng: null, weather: null, isLoading: true });
    (async () => {
      let lat: number | null = null;
      let lng: number | null = null;
      if (matched && matched.lat !== undefined && matched.lng !== undefined) {
        lat = matched.lat;
        lng = matched.lng;
      } else {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(peak.name)}&format=json&limit=1&countrycodes=tw`,
            { headers: { 'Accept': 'application/json' } }
          );
          const arr = await res.json();
          if (arr && arr.length > 0) {
            lat = parseFloat(arr[0].lat);
            lng = parseFloat(arr[0].lon);
          }
        } catch { /* ignore */ }
      }
      if (cancelled) return;
      if (lat === null || lng === null) {
        setPeakLive({ name: peak.name, lat: null, lng: null, weather: null, isLoading: false });
        return;
      }
      let weather = null;
      try {
        weather = await MountainService.getRealtimeWeather(lat, lng);
      } catch { /* ignore */ }
      if (cancelled) return;
      setPeakLive({ name: peak.name, lat, lng, weather, isLoading: false });
    })();
    return () => { cancelled = true; };
  }, [searchQuery]);

  const getWeatherIcon = (code: number, size = 22) => {
    if (code === 0 || code === 1) return <Sun size={size} />;
    if ([2, 3, 45, 48].includes(code)) return <Cloud size={size} />;
    if (code >= 51 && code <= 99) return <CloudRain size={size} />;
    return <Cloud size={size} />;
  };

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

  // 支援 selectedLevel 為單值或逗號分隔多值（例：「挑戰級,專家級」用於「進階」分類）
  const levelFilters = selectedLevel === '全部' ? [] : selectedLevel.split(',').map(s => s.trim()).filter(Boolean);

  // 根據選擇的條件過濾路線
  const filteredRoutes = routes.filter(route => {
    const matchRegion = selectedRegion === '全部' || route.region === selectedRegion;
    const matchLevel = levelFilters.length === 0 || levelFilters.includes(route.level);

    // 優化搜尋邏輯：支援標題、描述、區域與等級的關鍵字搜尋
    const searchLower = searchQuery.toLowerCase().trim();
    const matchSearch = !searchLower ||
      route.title.toLowerCase().includes(searchLower) ||
      route.desc.toLowerCase().includes(searchLower) ||
      route.region.toLowerCase().includes(searchLower) ||
      route.level.toLowerCase().includes(searchLower);

    return matchRegion && matchLevel && matchSearch;
  });

  // 智慧比對：依使用者選的山岳，找到最適合的站內路線（用於導向 RouteDetail 完整規劃）
  // 比對優先序：完全相等 → 互相包含 → 去除「東/西/南/北/前」峰後綴後的根名比對
  const matchedRoute = () => {
    const q = searchQuery.trim();
    if (!q) return null;
    const exact = routesData.find(r => r.title === q);
    if (exact) return exact;
    const partial = routesData.find(r => r.title.includes(q) || q.includes(r.title));
    if (partial) return partial;
    // 例：玉山東峰 → 玉山 → 比對玉山主峰
    const root = q.replace(/(東|西|南|北|前)峰$/, '');
    if (root !== q) {
      const rootMatch = routesData.find(r => r.title.includes(root));
      if (rootMatch) return rootMatch;
    }
    return null;
  };

  // 處理「立即篩選」：停留本頁，跑模擬載入後捲到結果區（呈現精選單卡或介紹清單）
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
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
                {/* 山岳下拉選單（含台灣百岳） */}
                <div className="filter-group">
                  <label className="filter-label">
                    選擇山岳 MOUNTAIN
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                    <select
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-bg-base/50 border border-border rounded-lg outline-none focus:border-primary transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="">全部山岳</option>
                      <optgroup label="── 台灣百岳（100 座）──">
                        {TAIWAN_100_PEAKS.map((p, i) => (
                          <option key={p} value={p}>{String(i + 1).padStart(3, '0')}　{p}</option>
                        ))}
                      </optgroup>
                      {OTHER_ROUTE_OPTIONS.length > 0 && (
                        <optgroup label="── 其他熱門路線 ──">
                          {OTHER_ROUTE_OPTIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
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
                <button
                  type="button"
                  onClick={() => {
                    // 一律導到 RouteDetail 完整規劃頁（建議行程/AI/入山申請/GPX/天氣）
                    // 站內無完全對應時，matchedRoute 會用根名 fallback（例：玉山東峰 → 玉山主峰）
                    const route = matchedRoute();
                    if (route) {
                      navigate(`/route/${route.id}`);
                      return;
                    }
                    document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="action-btn-outline gap-2"
                >
                  <Calendar size={16} /> 查看我的行程
                </button>
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
          {/* 結果標題：依搜尋情境動態顯示 */}
          {(() => {
            const q = searchQuery.trim();
            const hasFilter = selectedRegion !== '全部' || selectedLevel !== '全部';
            let title = '熱門推薦';
            let subtitle = '為您精選的山岳挑戰';
            if (q) {
              title = `${q} 搜尋結果`;
              subtitle = filteredRoutes.length > 0
                ? `本站收錄 ${filteredRoutes.length} 條相關路線`
                : '本站尚未收錄此路線，下方為對應百岳資料卡';
            } else if (hasFilter) {
              const tags = [
                selectedRegion !== '全部' ? selectedRegion : null,
                selectedLevel !== '全部' ? selectedLevel : null,
              ].filter(Boolean).join('・');
              title = `${tags} 推薦`;
              subtitle = filteredRoutes.length > 0
                ? `共 ${filteredRoutes.length} 條符合的路線`
                : '查無符合條件的路線，請放寬篩選條件';
            }
            return (
              <div className="mb-12 md:mb-20">
                <h2 className="font-serif text-4xl md:text-[2.8rem] font-bold text-primary tracking-tight mb-4">{title}</h2>
                <p className="text-text-muted text-base md:text-lg tracking-wide">{subtitle}</p>
              </div>
            );
          })()}

          <div className="w-full">
            {/* 精選路線大卡片（橫向滿版） */}
            <div className="w-full bg-white relative">
              {!searchQuery.trim() && filteredRoutes.length > 0 ? (
                /* 分類瀏覽（無關鍵字）：呈現所有符合路線的介紹清單 */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRoutes.map((route) => (
                    <Link
                      key={route.id}
                      to={`/route/${route.id}`}
                      className="group block bg-white rounded-lg overflow-hidden border border-border hover:border-accent transition-colors shadow-sm hover:shadow-[0_20px_40px_rgba(27,43,35,0.08)]"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={route.img}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt={route.title}
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3 text-[0.7rem] font-bold tracking-widest uppercase">
                          <span className="text-accent">{route.region}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-primary">{route.level}</span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                          {route.title}
                        </h3>
                        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                          {route.desc}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex flex-wrap gap-3 text-[0.7rem] text-text-muted">
                            {route.distance && <span>里程 <strong className="text-primary">{route.distance}</strong></span>}
                            {route.duration && <span>天數 <strong className="text-primary">{route.duration}</strong></span>}
                          </div>
                          <span className="text-[0.65rem] font-bold text-primary tracking-widest uppercase inline-flex items-center gap-1 group-hover:text-accent transition-colors">
                            完整規劃 <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : filteredRoutes.length > 0 ? (
                <div className="group grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                  <div className="relative overflow-hidden rounded-lg shadow-[0_30px_60px_rgba(27,43,35,0.08)] aspect-[4/3] lg:sticky lg:top-32">
                    <img
                      src={filteredRoutes[0].img}
                      className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                      alt={filteredRoutes[0].title}
                    />
                    <div className="absolute top-6 left-6 bg-accent text-white px-5 py-2 text-[0.75rem] font-bold tracking-widest uppercase rounded-sm">
                      本日精選
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-accent font-bold tracking-widest uppercase text-sm">{filteredRoutes[0].region}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span className="text-primary font-bold tracking-widest uppercase text-sm">{filteredRoutes[0].level}</span>
                    </div>
                    <h3 className="font-serif text-3xl md:text-[3.2rem] font-bold text-primary tracking-tight leading-none mb-6">
                      {filteredRoutes[0].title}
                    </h3>
                    <p className="text-text-muted text-xl leading-relaxed mb-10">
                      {filteredRoutes[0].desc}
                    </p>

                    {/* 建議行程 Itinerary：直接內嵌於搜尋結果（同 RouteDetail 時間軸樣式） */}
                    {filteredRoutes[0].itinerary && filteredRoutes[0].itinerary.length > 0 && (
                      <div className="mb-10">
                        <h4 className="text-xl font-serif font-bold text-primary mb-6 border-l-4 border-accent pl-4">建議行程 Itinerary</h4>
                        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                          {filteredRoutes[0].itinerary.map((item, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                              <div className="w-6 h-6 rounded-full bg-white border-4 border-accent z-10 flex-none mt-1" />
                              <div className="bg-white p-4 rounded-xl border border-border flex-1 shadow-sm hover:border-accent transition-colors">
                                <p className="text-primary text-sm font-medium leading-relaxed">{item}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
              ) : (() => {
                // 沒有匹配路線時，若關鍵字命中百岳則顯示百岳資料卡
                const peak = findPeakByName(searchQuery);
                if (peak) {
                  return (
                    <div className="bg-white rounded-lg border border-border shadow-[0_30px_60px_rgba(27,43,35,0.06)] overflow-hidden">
                      <div className="bg-gradient-to-br from-primary to-primary/85 text-white p-8">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-accent text-white text-[0.65rem] font-bold tracking-widest uppercase rounded-sm">
                            台灣百岳 #{String(peak.rank).padStart(3, '0')}
                          </span>
                          <span className="text-white/70 text-[0.7rem] tracking-widest uppercase">{peak.range}</span>
                        </div>
                        <h3 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">{peak.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">{peak.elevation.toLocaleString()}</span>
                          <span className="text-white/70 text-sm">公尺</span>
                        </div>
                      </div>
                      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-5">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[0.6rem] font-extrabold text-primary uppercase tracking-widest opacity-40 mb-1">編號</p>
                              <p className="text-xl font-bold text-primary">No. {peak.rank}</p>
                            </div>
                            <div>
                              <p className="text-[0.6rem] font-extrabold text-primary uppercase tracking-widest opacity-40 mb-1">海拔</p>
                              <p className="text-xl font-bold text-primary">{peak.elevation.toLocaleString()}m</p>
                            </div>
                            <div>
                              <p className="text-[0.6rem] font-extrabold text-primary uppercase tracking-widest opacity-40 mb-1">山系</p>
                              <p className="text-xl font-bold text-primary">{peak.range.replace('山脈', '')}</p>
                            </div>
                          </div>
                          <div className="bg-bg-base/60 p-5 rounded-lg flex items-start gap-3">
                            <Mountain size={18} className="text-accent mt-0.5 flex-none" />
                            <p className="text-sm text-text-muted leading-relaxed">
                              目前站內尚未收錄此路線的詳細攻略。可至下方連結查看其他山友分享的紀錄與 GPX 軌跡，並於「天氣查詢」確認即時氣象。
                            </p>
                          </div>
                        </div>
                        {/* 右欄：即時座標、天氣、Windy 互動氣象圖、跳轉按鈕 */}
                        {peakLive && peakLive.name === peak.name && (
                          <div className="space-y-4">
                            {peakLive.isLoading && (
                              <div className="bg-bg-base/60 p-4 rounded-lg text-center text-xs text-text-muted">
                                正在抓取座標與即時氣象資料...
                              </div>
                            )}

                            {!peakLive.isLoading && peakLive.lat !== null && peakLive.lng !== null && (
                              <>
                                {/* 即時天氣 + 座標 一條線 */}
                                <div className="bg-white border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-text-muted text-xs pr-3 border-r border-border">
                                    <MapPin size={11} className="text-accent" />
                                    <span>{peakLive.lat.toFixed(4)}, {peakLive.lng.toFixed(4)}</span>
                                  </div>
                                  {peakLive.weather ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <span className="text-accent">{getWeatherIcon(peakLive.weather.code, 18)}</span>
                                        <span className="text-2xl font-bold text-primary leading-none">{peakLive.weather.temp}°</span>
                                        <span className="text-text-muted text-xs">體感 {peakLive.weather.feel}°</span>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[0.65rem] tracking-widest">
                                          {peakLive.weather.status}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <Droplets size={12} className="text-text-muted" />
                                        <span className="font-bold text-primary">{peakLive.weather.rain}%</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <Wind size={12} className="text-text-muted" />
                                        <span className="font-bold text-primary">{peakLive.weather.wind} km/h</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <Thermometer size={12} className="text-text-muted" />
                                        <span className="font-bold text-primary">{peakLive.weather.humidity}%</span>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-xs text-text-muted">氣象資料暫無</span>
                                  )}
                                  <span className="ml-auto text-[0.6rem] text-text-muted tracking-widest uppercase">Open-Meteo Real-time</span>
                                </div>

                                {/* Windy 互動氣象地圖內嵌 */}
                                <div className="rounded-lg overflow-hidden border border-border">
                                  <iframe
                                    title={`Windy ${peakLive.name}`}
                                    src={`https://embed.windy.com/embed2.html?lat=${peakLive.lat}&lon=${peakLive.lng}&detailLat=${peakLive.lat}&detailLon=${peakLive.lng}&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
                                    width="100%"
                                    height="320"
                                    className="w-full block border-0"
                                    allow="geolocation"
                                  />
                                </div>
                              </>
                            )}

                            {!peakLive.isLoading && peakLive.lat === null && (
                              <div className="bg-bg-base/60 p-4 rounded-lg text-center text-xs text-text-muted">
                                無法取得此百岳座標，請改用「即時氣象」頁手動輸入。
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1">
                              <Link
                                to={`/weather?q=${encodeURIComponent(peak.name)}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-md hover:bg-accent transition-colors"
                              >
                                即時氣象 <ArrowRight size={12} />
                              </Link>
                              <Link
                                to={`/peaks-map?focus=${encodeURIComponent(peak.name)}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary text-primary text-xs font-bold tracking-widest uppercase rounded-md hover:bg-primary hover:text-white transition-colors"
                              >
                                地圖 <MapPin size={12} />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                // 預設無結果顯示
                return (
                  <div className="bg-bg-base p-20 rounded-lg text-center border-2 border-dashed border-border">
                    <Search size={48} className="mx-auto text-border mb-6" />
                    <h3 className="text-2xl font-serif text-primary mb-2">找不到符合的路線</h3>
                    <p className="text-text-muted">請嘗試調整篩選條件或關鍵字</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
