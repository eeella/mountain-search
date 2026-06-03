import { useState, useEffect, useRef, ReactNode, ImgHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, Info, Wind, Thermometer, Droplets, Plus, X, Printer, Search, Mountain, MapPin, Cloud, Sun, CloudRain } from 'lucide-react';
import { routesData } from '../constants/routes';
import { findPeakByName, TAIWAN_100_PEAKS } from '../constants/taiwan100Peaks';
import { MountainService } from '../services/mountainService';

/**
 * 安全圖片組件，當圖片載入失敗時顯示預設佔位圖
 */
function SafeImage({ src, alt, className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = useState(false);
  const placeholder = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"; // 預設大山背景

  return (
    <img
      src={error ? placeholder : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}

/**
 * 行前安全準備頁面組件，包含保險、裝備與工具的分類指南
 */
export default function Preparation() {
  // 接受 ?tab=insurance|equipment|tools|tracks URL 參數
  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    return t && ['insurance', 'equipment', 'tools'].includes(t) ? t : 'insurance';
  })();
  const [activeTab, setActiveTab] = useState(initialTab); // 當前選中的標籤頁
  const [activeSubTab, setActiveSubTab] = useState('all'); // 當前選中的子標籤頁
  const [isGenerating, setIsGenerating] = useState(false); // 是否正在產生指南
  const [selectedRoute, setSelectedRoute] = useState(''); // 表單路線下拉
  const gpxCardRef = useRef<HTMLDivElement>(null); // 「搜尋路線軌跡」結果卡 ref，用於滾動定位


  // 軌跡搜尋
  const [gpxQuery, setGpxQuery] = useState('');
  const [gpxResult, setGpxResult] = useState<{
    name: string;
    peak?: { rank: number; elevation: number; range: string };
    route?: { id: string; region: string; level: string; elevation?: string; distance?: string; duration?: string };
    lat?: number | null;
    lng?: number | null;
    weather?: { temp: number; feel: number; status: string; rain: number; wind: number; humidity: number; code: number } | null;
    isLoadingLive?: boolean;
  } | null>(null);

  const getWeatherIcon = (code: number, size = 18) => {
    if (code === 0 || code === 1) return <Sun size={size} />;
    if ([2, 3, 45, 48].includes(code)) return <Cloud size={size} />;
    if (code >= 51 && code <= 99) return <CloudRain size={size} />;
    return <Cloud size={size} />;
  };

  const handleGpxSearch = async (nameOverride?: string) => {
    const q = (nameOverride ?? gpxQuery).trim();
    if (!q) {
      setGpxResult(null);
      return;
    }
    if (nameOverride !== undefined) setGpxQuery(q);
    const peak = findPeakByName(q) || TAIWAN_100_PEAKS.find(p => p.name.includes(q) || q.includes(p.name));
    const route = routesData.find(r => r.title === q) || routesData.find(r => r.title.includes(q) || q.includes(r.title));
    const name = peak?.name || route?.title || q;

    // 設定初始狀態（顯示資料卡 + loading 即時資料）
    setGpxResult({
      name,
      peak: peak ? { rank: peak.rank, elevation: peak.elevation, range: peak.range } : undefined,
      route: route ? {
        id: route.id, region: route.region, level: route.level,
        elevation: route.elevation, distance: route.distance, duration: route.duration,
      } : undefined,
      lat: null,
      lng: null,
      weather: null,
      isLoadingLive: true,
    });

    // 1) 嘗試從 routesData 拿座標
    let lat: number | null = null;
    let lng: number | null = null;
    if (route && route.lat !== undefined && route.lng !== undefined) {
      lat = route.lat;
      lng = route.lng;
    } else {
      // 2) Nominatim 查詢（限台灣）
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&countrycodes=tw`,
          { headers: { 'Accept': 'application/json' } }
        );
        const arr = await res.json();
        if (arr && arr.length > 0) {
          lat = parseFloat(arr[0].lat);
          lng = parseFloat(arr[0].lon);
        }
      } catch { /* ignore */ }
    }

    // 3) 抓即時天氣
    let weather = null;
    if (lat !== null && lng !== null) {
      try {
        weather = await MountainService.getRealtimeWeather(lat, lng);
      } catch { /* ignore */ }
    }

    setGpxResult(prev => prev ? { ...prev, lat, lng, weather, isLoadingLive: false } : prev);
  };

  // 行前檢查清單狀態：勾選、自訂項目、新增輸入
  const [checklistChecked, setChecklistChecked] = useState<Record<string, boolean>>({});
  const [checklistCustom, setChecklistCustom] = useState<Record<string, string[]>>({});
  const [checklistInput, setChecklistInput] = useState<Record<string, string>>({});

  const checklistCategories: { category: string; items: string[] }[] = [
    { category: '基本裝備 Essential', items: ['登山背包 (含背包套)', '登山鞋 (建議中高筒)', '排汗襪', '登山杖'] },
    { category: '衣物穿戴 Clothing', items: ['排汗衣 (底層)', '保暖衣 (中層)', '防水防風外套 (外層)', '登山褲', '毛帽/遮陽帽', '手套'] },
    { category: '導航與照明 Navigation', items: ['頭燈 (含備用電池)', '離線地圖 (手機下載)', '行動電源', '指北針/紙本地圖'] },
    { category: '安全與急救 Safety', items: ['個人藥品', '急救包', '求生毯', '哨子', '打火機'] },
    { category: '飲食與其他 Food & Misc', items: ['足夠飲水 (建議 2L+)', '行動糧/午餐', '個人餐具', '垃圾袋', '入山入園證 (紙本)'] },
  ];

  const toggleChecklist = (key: string) =>
    setChecklistChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const addCustomChecklistItem = (cat: string) => {
    const v = (checklistInput[cat] || '').trim();
    if (!v) return;
    setChecklistCustom(prev => ({ ...prev, [cat]: [...(prev[cat] || []), v] }));
    setChecklistInput(prev => ({ ...prev, [cat]: '' }));
  };

  const removeCustomChecklistItem = (cat: string, idx: number) => {
    const removed = (checklistCustom[cat] || [])[idx];
    setChecklistCustom(prev => ({ ...prev, [cat]: (prev[cat] || []).filter((_, i) => i !== idx) }));
    if (removed !== undefined) {
      const key = `${cat}::${removed}`;
      setChecklistChecked(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handlePrintChecklist = () => {
    const sections = checklistCategories
      .map(c => {
        const all = [...c.items, ...(checklistCustom[c.category] || [])];
        const checked = all.filter(item => checklistChecked[`${c.category}::${item}`]);
        return { category: c.category, items: checked };
      })
      .filter(s => s.items.length > 0);

    if (sections.length === 0) {
      alert('請先勾選想列印的項目');
      return;
    }

    const win = window.open('', '_blank');
    if (!win) return;

    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>行前檢查清單</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft JhengHei", "PingFang TC", sans-serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #1B2B23; }
    h1 { font-size: 22px; border-bottom: 3px solid #E87132; padding-bottom: 10px; margin-bottom: 6px; letter-spacing: 0.05em; }
    .date { color: #888; font-size: 12px; margin-bottom: 28px; }
    h2 { font-size: 15px; border-left: 4px solid #E87132; padding-left: 10px; margin-top: 24px; margin-bottom: 10px; color: #1B2B23; }
    ul { list-style: none; padding-left: 6px; margin: 0; }
    li { padding: 5px 0; font-size: 14px; display: flex; align-items: center; gap: 10px; }
    .box { display: inline-block; width: 14px; height: 14px; border: 1.5px solid #1B2B23; border-radius: 2px; flex: none; }
    @media print { body { margin: 0; } .noprint { display: none; } }
  </style>
</head>
<body>
  <h1>行前檢查清單</h1>
  <p class="date">列印時間：${escapeHtml(new Date().toLocaleString('zh-TW'))}</p>
  ${sections
    .map(s => `
  <h2>${escapeHtml(s.category)}</h2>
  <ul>${s.items.map(i => `<li><span class="box"></span>${escapeHtml(i)}</li>`).join('')}</ul>`)
    .join('')}
  <script>window.onload = () => { window.print(); };<\/script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  };

  // 當主標籤切換時，重置子標籤
  useEffect(() => {
    setActiveSubTab('all');
  }, [activeTab]);

  /**
   * 處理「創建登山指南」按鈕點擊
   * 模擬分析過程並顯示結果
   */
  const handleGenerate = async () => {
    setIsGenerating(true);
    if (selectedRoute) {
      await handleGpxSearch(selectedRoute);
    }
    setIsGenerating(false);
    // 等 DOM 更新後滾動到「專屬指南」結果卡
    requestAnimationFrame(() => {
      if (selectedRoute && gpxCardRef.current) {
        gpxCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  // 標籤頁配置
  const tabs = [
    { id: 'insurance', label: '保險指南' },
    { id: 'equipment', label: '裝備指南' },
    { id: 'tools', label: '工具指南' },
  ];

  return (
    <div className="flex flex-col">
      {/* 英雄區 (Hero Section) */}
      <section className="page-hero">
        <img 
          src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2000" 
          className="page-hero-img" 
          alt="Preparation Hero" 
        />
        <div className="page-hero-content">
          <h1 className="page-hero-title">行前安全準備</h1>
          <p className="tracking-[0.1em] text-sm opacity-80 uppercase">Safety & Equipment Checklist</p>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-6 md:px-10 w-full">
        {/* 指南產生表單 + 「專屬指南」結果卡：合併為單一外層卡，中間以 border-t 分隔 */}
        <div className="bg-white -mt-16 mb-16 rounded-xl shadow-elegant border border-border relative z-20 overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8">
            <div className="form-field">
              <label className="form-label">路線選擇 Route</label>
              <select
                className="form-select"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
              >
                <option value="">請選擇欲前往的路線</option>
                {routesData.map(r => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">預計天數 Duration</label>
              <select className="form-select">
                <option>1 天</option>
                <option>2 天</option>
                <option>3 天以上</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="generate-button"
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Shield size={20} />
                </motion.div>
              ) : <Shield size={20} />}
              {isGenerating ? '正在分析中...' : '創建我的登山指南'}
            </button>
          </div>

          {gpxResult && (
            <div ref={gpxCardRef} className="p-6 md:p-8 border-t border-border">
              <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-none">
                <Mountain size={18} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-primary">{gpxResult.name} 專屬指南</h3>
                <p className="text-xs text-text-muted mt-0.5">百岳資料、本站攻略、即時座標、氣象與 Windy 地圖</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={gpxResult.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {gpxResult.peak && (
                    <span className="px-2.5 py-1 bg-accent text-white text-[0.65rem] font-bold tracking-widest uppercase rounded-sm">
                      百岳 #{String(gpxResult.peak.rank).padStart(3, '0')}
                    </span>
                  )}
                  {gpxResult.route && (
                    <span className="px-2.5 py-1 bg-primary text-white text-[0.65rem] font-bold tracking-widest uppercase rounded-sm">
                      本站收錄
                    </span>
                  )}
                </div>

                {(gpxResult.peak || gpxResult.route) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {gpxResult.peak && (
                      <>
                        <div className="bg-bg-base/60 p-3 rounded-md">
                          <p className="text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">海拔</p>
                          <p className="font-bold text-primary">{gpxResult.peak.elevation.toLocaleString()}m</p>
                        </div>
                        <div className="bg-bg-base/60 p-3 rounded-md">
                          <p className="text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">山系</p>
                          <p className="font-bold text-primary">{gpxResult.peak.range.replace('山脈', '')}</p>
                        </div>
                      </>
                    )}
                    {gpxResult.route && (
                      <>
                        {gpxResult.route.distance && (
                          <div className="bg-bg-base/60 p-3 rounded-md">
                            <p className="text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">總里程</p>
                            <p className="font-bold text-primary">{gpxResult.route.distance}</p>
                          </div>
                        )}
                        {gpxResult.route.duration && (
                          <div className="bg-bg-base/60 p-3 rounded-md">
                            <p className="text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">預計天數</p>
                            <p className="font-bold text-primary">{gpxResult.route.duration}</p>
                          </div>
                        )}
                        <div className="bg-bg-base/60 p-3 rounded-md">
                          <p className="text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">區域</p>
                          <p className="font-bold text-primary flex items-center gap-1"><MapPin size={11} /> {gpxResult.route.region}</p>
                        </div>
                        <div className="bg-bg-base/60 p-3 rounded-md">
                          <p className="text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">難度</p>
                          <p className="font-bold text-primary">{gpxResult.route.level}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!gpxResult.peak && !gpxResult.route && (
                  <p className="text-xs text-text-muted bg-bg-base/40 p-3 rounded-md flex items-start gap-2">
                    <Info size={13} className="text-accent mt-0.5 flex-none" />
                    <span>本站尚未收錄此路線詳細資料，但可在以下外站找到山友分享的 GPX 軌跡。</span>
                  </p>
                )}

                {gpxResult.isLoadingLive && (
                  <div className="bg-bg-base/60 p-4 rounded-md text-center text-xs text-text-muted">
                    正在抓取座標與即時氣象資料...
                  </div>
                )}

                {!gpxResult.isLoadingLive && gpxResult.lat !== null && gpxResult.lat !== undefined && gpxResult.lng !== null && gpxResult.lng !== undefined && (
                  <>
                    <div className="bg-white border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-text-muted text-xs pr-3 border-r border-border">
                        <MapPin size={11} className="text-accent" />
                        <span>{gpxResult.lat.toFixed(4)}, {gpxResult.lng.toFixed(4)}</span>
                      </div>
                      {gpxResult.weather ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-accent">{getWeatherIcon(gpxResult.weather.code, 18)}</span>
                            <span className="text-2xl font-bold text-primary leading-none">{gpxResult.weather.temp}°</span>
                            <span className="text-text-muted text-xs">體感 {gpxResult.weather.feel}°</span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[0.65rem] tracking-widest">
                              {gpxResult.weather.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Droplets size={12} className="text-text-muted" />
                            <span className="font-bold text-primary">{gpxResult.weather.rain}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Wind size={12} className="text-text-muted" />
                            <span className="font-bold text-primary">{gpxResult.weather.wind} km/h</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Thermometer size={12} className="text-text-muted" />
                            <span className="font-bold text-primary">{gpxResult.weather.humidity}%</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-text-muted">氣象資料暫無</span>
                      )}
                      <span className="ml-auto text-[0.6rem] text-text-muted tracking-widest uppercase">Open-Meteo Real-time</span>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-border">
                      <iframe
                        title={`Windy ${gpxResult.name}`}
                        src={`https://embed.windy.com/embed2.html?lat=${gpxResult.lat}&lon=${gpxResult.lng}&detailLat=${gpxResult.lat}&detailLon=${gpxResult.lng}&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
                        width="100%"
                        height="360"
                        className="w-full block border-0"
                        allow="geolocation"
                      />
                    </div>
                  </>
                )}

                {!gpxResult.isLoadingLive && (gpxResult.lat === null || gpxResult.lat === undefined) && (
                  <div className="bg-bg-base/60 p-4 rounded-md text-center text-xs text-text-muted">
                    無法取得此路線座標，請改用「即時氣象」頁手動輸入。
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {gpxResult.route && (
                    <Link
                      to={`/route/${gpxResult.route.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-md hover:bg-accent transition-colors"
                    >
                      查看站內攻略
                    </Link>
                  )}
                  <Link
                    to={`/weather?q=${encodeURIComponent(gpxResult.name)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary text-primary text-xs font-bold tracking-widest uppercase rounded-md hover:bg-primary hover:text-white transition-colors"
                  >
                    即時氣象
                  </Link>
                  <Link
                    to={`/peaks-map?focus=${encodeURIComponent(gpxResult.name)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary text-primary text-xs font-bold tracking-widest uppercase rounded-md hover:bg-primary hover:text-white transition-colors"
                  >
                    地圖 <MapPin size={12} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
            </div>
          )}
        </div>

        {/* 主標籤導覽 (Main Tabs) */}
        <nav className="flex max-w-[800px] mx-auto shadow-sm rounded-full overflow-hidden bg-white mb-20 border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 text-center py-4 md:py-5 font-semibold text-sm md:text-base transition-all duration-300 whitespace-nowrap px-2",
                activeTab === tab.id 
                  ? "bg-primary text-white" 
                  : "text-text-muted hover:bg-bg-base hover:text-primary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 內容區域 (Content Section) */}
        <AnimatePresence mode="wait">
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-32"
          >
            {/* 保險指南內容 */}
            {activeTab === 'insurance' && (
              <div className="space-y-10">
                <div className="flex justify-center gap-10 mb-10 border-b border-border">
                  {[
                    { id: 'all', label: '全部保險方案' },
                    { id: 'cases', label: '理賠案例' },
                    { id: 'steps', label: '投保步驟' }
                  ].map((sub) => (
                    <span 
                      key={sub.id} 
                      onClick={() => setActiveSubTab(sub.id)}
                      className={cn(
                        "pb-4 font-semibold text-sm cursor-pointer transition-colors relative", 
                        activeSubTab === sub.id ? "text-primary" : "text-text-muted hover:text-primary"
                      )}
                    >
                      {sub.label}
                      {activeSubTab === sub.id && (
                        <motion.div layoutId="subtab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </span>
                  ))}
                </div>
                
                <AnimatePresence mode="wait">
                  {activeSubTab === 'all' && (
                    <motion.div 
                      key="insurance-all"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      <InsuranceCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/CH.SZ.Stoos_Fronalpstock_Sequence_Rescue-Helicopter_REGA_16K_16x9-R.jpg/1280px-CH.SZ.Stoos_Fronalpstock_Sequence_Rescue-Helicopter_REGA_16K_16x9-R.jpg"
                        icon={<Shield className="w-12 h-12 text-primary" />}
                        badge="官方推薦方案"
                        title="國泰產險 登山基本型"
                        price="642"
                        desc={["意外身故及失能保險 200 萬", "登山突發疾病住院日額 20 萬", "緊急救援費用 50 萬"]}
                        link="https://www.cathay-ins.com.tw/cathayins/personal/travel/climb/"
                      />
                      <InsuranceCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Climbing_in_the_Himalayas.JPG/1280px-Climbing_in_the_Himalayas.JPG"
                        icon={<Shield className="w-12 h-12 text-accent" />}
                        badge="熱門選擇"
                        title="富邦產險 登山綜合險"
                        price="448"
                        desc={["意外死亡及失能保險 200 萬", "緊急救援補償費用 50 萬", "醫療費用實支實付 20 萬"]}
                        link="https://www.fubon.com/insurance/b2c/content/climbing_insurance/index.html"
                      />
                      <InsuranceCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mountaineering_Man_Trail_Path_Mountains.jpg/1280px-Mountaineering_Man_Trail_Path_Mountains.jpg"
                        icon={<Shield className="w-12 h-12 text-secondary" />}
                        badge="高 CP 值"
                        title="明台產險 登山險"
                        price="380"
                        desc={["意外身故及失能 100 萬", "搜救費用 30 萬", "第三人責任險 50 萬"]}
                        link="https://www.msig-mingtai.com.tw/?insurance-travel=%E6%98%8E%E5%8F%B0%E7%94%A2%E7%89%A9%E7%99%BB%E5%B1%B1%E7%B6%9C%E5%90%88%E4%BF%9D%E9%9A%AA"
                      />
                      <div className="bg-primary p-10 flex flex-col items-center justify-center text-center text-white rounded-sm border-t-8 border-accent">
                        <h2 className="font-serif text-2xl mb-4">山中氣候瞬息萬變</h2>
                        <p className="opacity-70 text-sm leading-relaxed mb-6">請確保保障充足，保障您的每一次冒險。</p>
                        <Link to="/learning" className="text-accent font-bold text-sm border-b border-accent hover:text-white hover:border-white transition-all">查看安全知識 →</Link>
                      </div>
                    </motion.div>
                  )}

                  {activeSubTab === 'cases' && (
                    <motion.div 
                      key="insurance-cases"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white p-10 rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <AlertCircle className="text-accent" size={32} />
                        <h3 className="text-2xl font-serif font-bold text-primary">真實理賠案例分享</h3>
                      </div>
                      <div className="space-y-8">
                        <div className="p-6 bg-bg-base rounded-lg border-l-4 border-accent">
                          <h4 className="font-bold text-lg mb-2">案例一：雪山圈谷突發高山症</h4>
                          <p className="text-text-muted text-sm leading-relaxed">
                            山友於雪山圈谷紮營時出現嚴重嘔吐與意識模糊，經領隊判斷為急性高山症。隨即啟動緊急救援，由直升機吊掛下山。
                            最終理賠：醫療費用 5 萬 + 緊急救援費用 45 萬，全額由登山險負擔。
                          </p>
                        </div>
                        <div className="p-6 bg-bg-base rounded-lg border-l-4 border-primary">
                          <h4 className="font-bold text-lg mb-2">案例二：北大武山步道滑倒骨折</h4>
                          <p className="text-text-muted text-sm leading-relaxed">
                            山友於北大武山 7K 處因天雨路滑不慎摔落邊坡，造成左腿開放性骨折。由搜救隊員背負下山。
                            最終理賠：實支實付醫療險 12 萬，補貼手術與後續復健費用。
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSubTab === 'steps' && (
                    <motion.div 
                      key="insurance-steps"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white p-10 rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <Info className="text-primary" size={32} />
                        <h3 className="text-2xl font-serif font-bold text-primary">投保三步驟</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { step: '01', title: '確認行程', desc: '確認登山路線、天數與同行人數。' },
                          { step: '02', title: '線上試算', desc: '選擇合適方案，輸入基本資料進行保費試算。' },
                          { step: '03', title: '完成支付', desc: '使用信用卡或行動支付完成投保，並保留電子保單。' }
                        ].map((s) => (
                          <div key={s.step} className="text-center p-6 border border-bg-base rounded-lg">
                            <span className="text-4xl font-serif font-bold text-accent/20 block mb-4">{s.step}</span>
                            <h4 className="font-bold text-lg mb-2">{s.title}</h4>
                            <p className="text-text-muted text-sm">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 裝備指南內容 */}
            {activeTab === 'equipment' && (
              <div className="space-y-10">
                <div className="flex justify-center gap-10 mb-10 border-b border-border overflow-x-auto">
                  {[
                    { id: 'all', label: '全部裝備' },
                    { id: 'checklist', label: '行前檢查清單' },
                    { id: 'wear', label: '穿戴建議' }
                  ].map((sub) => (
                    <span 
                      key={sub.id} 
                      onClick={() => setActiveSubTab(sub.id)}
                      className={cn(
                        "pb-4 font-semibold text-sm cursor-pointer whitespace-nowrap transition-colors relative", 
                        activeSubTab === sub.id ? "text-primary" : "text-text-muted hover:text-primary"
                      )}
                    >
                      {sub.label}
                      {activeSubTab === sub.id && (
                        <motion.div layoutId="subtab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </span>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeSubTab === 'all' && (
                    <motion.div 
                      key="equip-all"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Arcteryx_Aerios%2C_OutDoor_2018%2C_Friedrichshafen_%281X7A0379%29.jpg/1280px-Arcteryx_Aerios%2C_OutDoor_2018%2C_Friedrichshafen_%281X7A0379%29.jpg"
                        tag="#必備裝備"
                        title="專業登山鞋"
                        desc="提供良好的抓地力與足踝支撐。建議選擇中高筒防水款式（如 GORE-TEX），應對碎石與泥濘地形。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=944"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Sub_Zero_Factor_1_Plus_Womens_Long_Sleeve_Base_Layer_Top_Black_%2845552705201%29.jpg/1280px-Sub_Zero_Factor_1_Plus_Womens_Long_Sleeve_Base_Layer_Top_Black_%2845552705201%29.jpg"
                        tag="#第一層防線"
                        title="機能排汗衣"
                        desc="登山服飾的核心。快速帶走汗水避免失溫。切記「吸汗不乾」的棉質衣物是寒冷致命的殺手。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=5837"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Osprey_Atmos_AG_65_Backpack_%2847347379172%29.jpg/1280px-Osprey_Atmos_AG_65_Backpack_%2847347379172%29.jpg"
                        tag="#負重核心"
                        title="人體工學登山背包"
                        desc="具備完善的負重轉移系統，將重量由肩膀轉移至髖部，節省體力並保護脊椎。建議 40L 以上。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=15174"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Down_suit.JPG/1280px-Down_suit.JPG"
                        tag="#保暖層"
                        title="輕量羽絨外套"
                        desc="高海拔氣溫驟降，靜止時需立即穿上保暖。選擇高蓬鬆度（800FP+）且可收納至極小的款式。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=3155"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Bushwalking_in_the_rain_at_Kosciuszko_National_Park.jpg/1280px-Bushwalking_in_the_rain_at_Kosciuszko_National_Park.jpg"
                        tag="#防雨層"
                        title="硬殼防水外套"
                        desc="山區雨勢難測，防水透氣外套是生命線。除了擋雨，還能有效阻隔寒風侵襲。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=2582"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/1/12/Hiking_pole.jpg"
                        tag="#輔助工具"
                        title="輕量登山杖"
                        desc="減輕膝蓋負擔，增加行進間的穩定性。建議使用一對，並學會正確的調整與使用技巧。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=11152"
                      />
                    </motion.div>
                  )}

                  {activeSubTab === 'checklist' && (
                    <motion.div 
                      key="equip-checklist"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div className="bg-white p-10 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-8 border-b border-bg-base pb-6">
                          <CheckCircle2 className="text-accent" size={32} />
                          <div>
                            <h3 className="text-2xl font-serif font-bold text-primary">行前檢查清單 Checklist</h3>
                            <p className="text-text-muted text-sm mt-1">出發前請逐一確認，確保裝備完整無缺。</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {checklistCategories.map((cat, idx) => {
                            const customs = checklistCustom[cat.category] || [];
                            return (
                              <div key={idx} className="space-y-4">
                                <h4 className="font-bold text-primary border-l-4 border-accent pl-3 py-1 bg-bg-base/50">{cat.category}</h4>
                                <div className="space-y-3 pl-4">
                                  {cat.items.map((item) => {
                                    const key = `${cat.category}::${item}`;
                                    return (
                                      <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                          type="checkbox"
                                          checked={!!checklistChecked[key]}
                                          onChange={() => toggleChecklist(key)}
                                          className="w-5 h-5 rounded border-border text-accent focus:ring-accent transition-all cursor-pointer"
                                        />
                                        <span className={cn(
                                          'text-sm transition-colors',
                                          checklistChecked[key] ? 'text-primary line-through opacity-60' : 'text-text-muted group-hover:text-primary'
                                        )}>{item}</span>
                                      </label>
                                    );
                                  })}
                                  {customs.map((item, i) => {
                                    const key = `${cat.category}::${item}`;
                                    return (
                                      <div key={`custom-${i}`} className="flex items-center gap-3 group">
                                        <input
                                          type="checkbox"
                                          checked={!!checklistChecked[key]}
                                          onChange={() => toggleChecklist(key)}
                                          className="w-5 h-5 rounded border-border text-accent focus:ring-accent transition-all cursor-pointer"
                                        />
                                        <span className={cn(
                                          'text-sm flex-1 transition-colors',
                                          checklistChecked[key] ? 'text-primary line-through opacity-60' : 'text-text-muted'
                                        )}>{item}</span>
                                        <button
                                          type="button"
                                          onClick={() => removeCustomChecklistItem(cat.category, i)}
                                          aria-label="刪除自訂項目"
                                          className="opacity-40 hover:opacity-100 hover:text-accent transition-all"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                  <div className="flex items-center gap-2 pt-2">
                                    <input
                                      type="text"
                                      value={checklistInput[cat.category] || ''}
                                      onChange={(e) => setChecklistInput(prev => ({ ...prev, [cat.category]: e.target.value }))}
                                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomChecklistItem(cat.category); } }}
                                      placeholder="自訂項目..."
                                      className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md outline-none focus:border-primary bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => addCustomChecklistItem(cat.category)}
                                      className="p-1.5 rounded-md bg-primary text-white hover:bg-accent transition-colors flex-none"
                                      aria-label="新增項目"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <p className="text-xs text-text-muted">
                            勾選您已備妥的項目，按下「列印已勾選項目」會帶到列印視窗（只會印出已勾選的）。
                          </p>
                          <button
                            type="button"
                            onClick={handlePrintChecklist}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-md hover:bg-accent transition-colors"
                          >
                            <Printer size={16} /> 列印已勾選項目
                          </button>
                        </div>

                        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-4">
                          <AlertCircle className="text-primary mt-1 flex-none" size={20} />
                          <p className="text-xs text-primary/80 leading-relaxed">
                            <strong>專業建議：</strong>裝備打包時，建議將重物置於背包中上部且靠近背部的位置，並將常用的物品（如雨具、頭燈、行動糧）放在最容易拿取的地方。出發前請務必檢查天氣預報與入山證件。
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSubTab === 'wear' && (
                    <motion.div 
                      key="equip-wear"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-12"
                    >
                      <div className="bg-white p-10 rounded-xl border border-border shadow-sm">
                        <h3 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                          <Thermometer className="text-accent" /> 高海拔洋蔥式穿法 (Layering System)
                        </h3>
                        <p className="text-text-muted mb-10 leading-relaxed">
                          山區氣候多變，從登山口到山頂溫差可能超過 15 度。採用三層穿法能有效調節體溫，避免出汗過多導致失溫。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="p-6 bg-bg-base rounded-lg border-t-4 border-primary">
                            <h4 className="font-bold text-lg mb-3">1. 基礎層 (Base Layer)</h4>
                            <p className="text-sm text-text-muted mb-4">功能：吸濕排汗，保持皮膚乾爽。</p>
                            <ul className="text-xs space-y-2 opacity-80">
                              <li>● 推薦材質：羊毛 (Merino) 或人造纖維</li>
                              <li>● 禁忌：純棉 (吸水不乾會奪走體熱)</li>
                            </ul>
                          </div>
                          <div className="p-6 bg-bg-base rounded-lg border-t-4 border-accent">
                            <h4 className="font-bold text-lg mb-3">2. 保暖層 (Mid Layer)</h4>
                            <p className="text-sm text-text-muted mb-4">功能：鎖住體溫，形成隔熱層。</p>
                            <ul className="text-xs space-y-2 opacity-80">
                              <li>● 推薦材質：羽絨外套或刷毛衣 (Fleece)</li>
                              <li>● 技巧：靜止休息時立即穿上</li>
                            </ul>
                          </div>
                          <div className="p-6 bg-bg-base rounded-lg border-t-4 border-secondary">
                            <h4 className="font-bold text-lg mb-3">3. 外殼層 (Outer Layer)</h4>
                            <p className="text-sm text-text-muted mb-4">功能：防風、防水、防雪。</p>
                            <ul className="text-xs space-y-2 opacity-80">
                              <li>● 推薦材質：Gore-Tex 或類似防水透氣膜</li>
                              <li>● 技巧：需具備可調式連帽與腋下通風拉鍊</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-xl border border-border flex gap-6 items-center">
                          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center flex-none">
                            <Wind className="text-accent" size={32} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-1">頭部與手部防護</h4>
                            <p className="text-sm text-text-muted">人體 30% 熱量從頭部散失。毛帽與防風手套是高海拔過夜的標配。</p>
                          </div>
                        </div>
                        <div className="bg-white p-8 rounded-xl border border-border flex gap-6 items-center">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-none">
                            <Droplets className="text-primary" size={32} />
                          </div>
                          <div>
                            <h4 className="font-bold text-primary mb-1">下半身穿著</h4>
                            <p className="text-sm text-text-muted">選擇耐磨、彈性佳的登山褲。雨天務必穿上雨褲，避免褲管濕透導致失溫。</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 工具指南內容 */}
            {activeTab === 'tools' && (
              <div className="space-y-10">
                <div className="flex justify-center gap-10 mb-10 border-b border-border overflow-x-auto">
                  {[
                    { id: 'all', label: '全部工具' },
                    { id: 'nav', label: '導航通訊' },
                    { id: 'tech', label: '技術裝備' },
                    { id: 'gpx', label: 'GPX 軌跡' }
                  ].map((sub) => (
                    <span 
                      key={sub.id} 
                      onClick={() => setActiveSubTab(sub.id)}
                      className={cn(
                        "pb-4 font-semibold text-sm cursor-pointer transition-colors relative", 
                        activeSubTab === sub.id ? "text-primary" : "text-text-muted hover:text-primary"
                      )}
                    >
                      {sub.label}
                      {activeSubTab === sub.id && (
                        <motion.div layoutId="subtab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </span>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeSubTab === 'all' && (
                    <motion.div 
                      key="tools-all"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Strap-on_crampon.JPG/1280px-Strap-on_crampon.JPG"
                        tag="#技術工具"
                        title="專業冰爪"
                        desc="冬季雪季登山必備，提供在冰雪硬面上的抓地力。需配合硬底登山鞋使用。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=3430"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/3_layers_emergency_blanket_-_mylar_.jpg/1280px-3_layers_emergency_blanket_-_mylar_.jpg"
                        tag="#緊急應變"
                        title="鋁箔求生毯"
                        desc="重量極輕但能反射體熱，是發生迫降或受傷時的救命裝備，請務必隨身攜帶。"
                        link="https://hiking.biji.co/index.php?q=review&act=info&review_id=17660"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/CLR-2_conducts_land_navigation_training_120322-M-PT151-629.jpg/1280px-CLR-2_conducts_land_navigation_training_120322-M-PT151-629.jpg"
                        tag="#導航必備"
                        title="指北針與地圖"
                        desc="電子設備可能沒電，傳統導航工具是最後的保障。學會判讀等高線是登山者的基本功。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=2740"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Petzl_Headlamp.jpg/1280px-Petzl_Headlamp.jpg"
                        tag="#照明設備"
                        title="高亮度頭燈"
                        desc="山區入夜極快，頭燈能空出雙手確保安全。請務必攜帶備用電池並確認亮度。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=1914"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/JetBoil-camping-stove-under-cooking-pot.jpg/1280px-JetBoil-camping-stove-under-cooking-pot.jpg"
                        tag="#炊事設備"
                        title="輕量化攻頂爐"
                        desc="在寒冷的山頂喝上一口熱水是極大的享受。選擇穩定性高且防風效果佳的款式。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=549"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/b/be/06.20_%E7%B8%BD%E7%B5%B1%E5%87%BA%E5%B8%AD%E3%80%8C%E5%85%A7%E6%94%BF%E9%83%A8%E6%B6%88%E9%98%B2%E7%BD%B230%E5%91%A8%E5%B9%B4%E7%BD%B2%E6%85%B6%E6%9A%A8%E7%AC%AC2%E6%9C%9F%E5%B7%A5%E7%A8%8B%E8%90%BD%E6%88%90%E5%95%9F%E7%94%A8%E5%85%B8%E7%A6%AE%E3%80%8D_-_54601651674_%28rotated_cropped_-_Garmin_inReach_Mini_2%29.jpg"
                        tag="#通訊設備"
                        title="衛星通訊器"
                        desc="在無手機訊號區的最後防線。可發送 SOS 訊號並讓家人追蹤您的即時位置。"
                        link="https://www.garmin.com.tw/products/outdoor/inreach-mini-2-black/"
                      />
                    </motion.div>
                  )}

                  {activeSubTab === 'nav' && (
                    <motion.div 
                      key="tools-nav"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/b/be/06.20_%E7%B8%BD%E7%B5%B1%E5%87%BA%E5%B8%AD%E3%80%8C%E5%85%A7%E6%94%BF%E9%83%A8%E6%B6%88%E9%98%B2%E7%BD%B230%E5%91%A8%E5%B9%B4%E7%BD%B2%E6%85%B6%E6%9A%A8%E7%AC%AC2%E6%9C%9F%E5%B7%A5%E7%A8%8B%E8%90%BD%E6%88%90%E5%95%9F%E7%94%A8%E5%85%B8%E7%A6%AE%E3%80%8D_-_54601651674_%28rotated_cropped_-_Garmin_inReach_Mini_2%29.jpg"
                        tag="#導航工具"
                        title="Garmin InReach 衛星通訊"
                        desc="在無手機訊號區的最後防線。可發送 SOS 訊號並讓家人追蹤您的即時位置。"
                        link="https://www.garmin.com.tw/products/outdoor/inreach-mini-2-black/"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Olkhon_Island%2C_GPS_navigation%2C_Smartphone%2C_Lake_Baikal%2C_Russia.jpg/1280px-Olkhon_Island%2C_GPS_navigation%2C_Smartphone%2C_Lake_Baikal%2C_Russia.jpg"
                        tag="#離線地圖"
                        title="Hikingbook / Gaia GPS"
                        desc="手機離線地圖是現代登山標配。務必預先下載地圖並學會判讀 GPX 軌跡。"
                        link="https://hikingbook.net/"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Baofeng_UV-5R_transceiver.jpg/1280px-Baofeng_UV-5R_transceiver.jpg"
                        tag="#緊急通訊"
                        title="無線電對講機"
                        desc="隊伍間短距離通訊的最佳工具，特別是在地形複雜或隊伍拉長時確保聯繫。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=970"
                      />
                    </motion.div>
                  )}

                  {activeSubTab === 'tech' && (
                    <motion.div 
                      key="tools-tech"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Strap-on_crampon.JPG/1280px-Strap-on_crampon.JPG"
                        tag="#雪季裝備"
                        title="12 齒專業冰爪"
                        desc="冬季雪季登山必備，提供在冰雪硬面上的抓地力。需配合硬底登山鞋使用。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=3430"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ice_axe_ski_basket.JPG/1280px-Ice_axe_ski_basket.JPG"
                        tag="#攀登工具"
                        title="輕量化冰斧"
                        desc="雪地行進間的支撐與滑落制動工具。使用前務必經過專業訓練。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=3431"
                      />
                      <EquipmentCard
                        img="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Climber_with_the_rock_climbing_equipment_on_mountain.jpg/1280px-Climber_with_the_rock_climbing_equipment_on_mountain.jpg"
                        tag="#防護裝備"
                        title="攀登安全帽"
                        desc="在易落石路段或技術攀登時保護頭部。輕量且通風的設計適合長途背負。"
                        link="https://hiking.biji.co/index.php?q=news&act=info&id=549"
                      />
                    </motion.div>
                  )}

                  {activeSubTab === 'gpx' && (
                    <motion.div
                      key="tools-gpx"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-10"
                    >
                      {/* 搜尋路線軌跡：輸入山岳/路線名 → 帶入上方「{name} 專屬指南」結果卡 */}
                      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-none">
                            <Search size={18} />
                          </div>
                          <div>
                            <h3 className="text-lg font-serif font-bold text-primary">搜尋路線軌跡</h3>
                            <p className="text-xs text-text-muted mt-0.5">輸入任意山岳/路線名，自動帶入「專屬指南」卡片</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                          <input
                            type="text"
                            value={gpxQuery}
                            onChange={(e) => setGpxQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleGpxSearch();
                                requestAnimationFrame(() => gpxCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                              }
                            }}
                            placeholder="例：玉山主峰、雪山、嘉明湖、七星山..."
                            className="flex-1 p-3 bg-bg-base/50 border border-border rounded-md outline-none focus:border-primary transition-all text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleGpxSearch();
                              requestAnimationFrame(() => gpxCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                            }}
                            className="px-8 py-3 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-md hover:bg-accent transition-colors inline-flex items-center justify-center gap-2"
                          >
                            <Search size={14} /> 搜尋
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <EquipmentCard
                          img="https://upload.wikimedia.org/wikipedia/commons/d/d8/HexaTrek_Track_OSM.png"
                          tag="#GPX 軌跡庫"
                          title="健行筆記 GPX 軌跡中心"
                          desc="台灣最大山友共享軌跡庫，依山名、路線搜尋下載即用。所有檔案皆由實際登山者上傳，附路線描述。"
                          link="https://hiking.biji.co/index.php?q=trail&act=gpx_list"
                        />
                        <EquipmentCard
                          img="https://upload.wikimedia.org/wikipedia/commons/6/69/Landform_of_Taiwan.png"
                          tag="#官方地形圖"
                          title="上河文化《高山百岳地形圖》"
                          desc="台灣百岳地形圖權威出版，提供等高線、山屋、水源等實用資訊，是規劃高山路線的標配。"
                          link="https://www.sunriver.com.tw/"
                        />
                        <EquipmentCard
                          img="https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Olkhon_Island%2C_GPS_navigation%2C_Smartphone%2C_Lake_Baikal%2C_Russia.jpg/1280px-Olkhon_Island%2C_GPS_navigation%2C_Smartphone%2C_Lake_Baikal%2C_Russia.jpg"
                          tag="#行動 APP"
                          title="Hikingbook 離線地圖"
                          desc="台灣團隊開發的登山 APP，支援 GPX 匯入、離線地圖、等高線顯示，記錄行程並可雲端同步。"
                          link="https://hikingbook.net/"
                        />
                        <EquipmentCard
                          img="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Magellan_Triton_2000_handheld_GPS_receiver_02.jpg/1280px-Magellan_Triton_2000_handheld_GPS_receiver_02.jpg"
                          tag="#國際 APP"
                          title="Gaia GPS"
                          desc="全球登山者愛用的離線地圖 APP，地圖層豐富（地形、衛星、降雪），國外健行的首選。"
                          link="https://www.gaiagps.com/"
                        />
                        <EquipmentCard
                          img="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Hiking_7117.JPG/1280px-Hiking_7117.JPG"
                          tag="#使用教學"
                          title="GPX 下載與離線地圖（iOS）"
                          desc="健行筆記官方 iOS 教學：下載 GPX 軌跡、製作離線地圖、判讀等高線一次學會。"
                          link="https://hiking.biji.co/index.php?q=news&act=info&id=13373"
                        />
                        <EquipmentCard
                          img="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/20260117_132458_BPA_trail_-_Cascade_Orienteering_Club_-_marker.jpg/1280px-20260117_132458_BPA_trail_-_Cascade_Orienteering_Club_-_marker.jpg"
                          tag="#使用教學"
                          title="GPX 下載與離線地圖（Android）"
                          desc="健行筆記官方 Android 教學：從 APP 內搜尋路線、查詢 GPX、下載到手機離線使用。"
                          link="https://hiking.biji.co/index.php?q=news&act=info&id=13634"
                        />
                      </div>

                      <div className="bg-white p-10 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-4 mb-8 border-b border-bg-base pb-6">
                          <Info className="text-accent" size={32} />
                          <div>
                            <h3 className="text-2xl font-serif font-bold text-primary">GPX 軌跡使用四步驟</h3>
                            <p className="text-text-muted text-sm mt-1">從下載到實際導航，新手也能上手。</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                          {[
                            { step: '01', title: '挑選路線軌跡', desc: '到健行筆記 GPX 中心搜尋目標山岳，比對多筆 GPX 的距離與爬升，挑「近期紀錄、評價高」的版本。' },
                            { step: '02', title: '下載 GPX 檔', desc: '點開 GPX 詳細頁，點「下載」存到手機。建議用 Hikingbook 或 Gaia GPS 直接「在 APP 中開啟」自動匯入。' },
                            { step: '03', title: '離線地圖預載', desc: '出發前在 APP 內把該區域地形圖「下載到裝置」。山區無訊號，沒預載就無法看圖。' },
                            { step: '04', title: '出發實測導航', desc: 'APP 開啟 GPX 軌跡 + GPS，與地圖等高線交叉比對。脫離軌跡 30 公尺以上一定回頭確認。' },
                          ].map((s) => (
                            <div key={s.step} className="flex gap-4">
                              <span className="text-3xl font-serif font-bold text-accent/30 flex-none">{s.step}</span>
                              <div>
                                <h4 className="font-bold text-primary mb-1">{s.title}</h4>
                                <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <a href="https://hiking.biji.co/index.php?q=news&act=info&id=13373" target="_blank" rel="noopener noreferrer" className="text-center p-4 bg-bg-base rounded-lg border border-border hover:border-accent hover:text-accent transition-all text-sm font-bold">
                            iOS 詳細教學 →
                          </a>
                          <a href="https://hiking.biji.co/index.php?q=news&act=info&id=13634" target="_blank" rel="noopener noreferrer" className="text-center p-4 bg-bg-base rounded-lg border border-border hover:border-accent hover:text-accent transition-all text-sm font-bold">
                            Android 詳細教學 →
                          </a>
                          <a href="https://hiking.biji.co/index.php?q=news&act=info&id=7848" target="_blank" rel="noopener noreferrer" className="text-center p-4 bg-bg-base rounded-lg border border-border hover:border-accent hover:text-accent transition-all text-sm font-bold">
                            OruxMaps 教學 →
                          </a>
                        </div>

                        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-4">
                          <AlertCircle className="text-primary mt-1 flex-none" size={20} />
                          <p className="text-xs text-primary/80 leading-relaxed">
                            <strong>安全提醒：</strong>GPX 軌跡是參考，不是聖經。山徑會隨地震、颱風、崩塌改變，務必搭配最新路況、紙本地圖、指北針交叉確認。隊伍中至少 2 人具備離線地圖判讀能力。
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * 保險方案卡片組件
 */
function InsuranceCard({ icon, badge, title, price, desc, link, img }: { icon: ReactNode, badge: string, title: string, price: string, desc: string[], link: string, img?: string }) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="insurance-card group hover:-translate-y-2">
      <div className="insurance-card-header">
        {img ? (
          <SafeImage src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" alt={title} />
        ) : (
          <div className="transform group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
      </div>
      <div className="insurance-card-body">
        <span className="insurance-badge">{badge}</span>
        <h3 className="text-xl font-semibold mb-4 text-primary">{title}</h3>
        <div className="insurance-price">${price} <span className="text-sm font-normal text-text-muted">/ 預估</span></div>
        <div className="text-sm text-text-muted leading-relaxed space-y-1">
          {desc.map((d, i) => <p key={i} className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent mt-1 flex-none" /> {d}</p>)}
        </div>
      </div>
    </a>
  );
}

/**
 * 裝備/工具卡片組件
 */
function EquipmentCard({ img, tag, title, desc, link }: { img: string, tag: string, title: string, desc: string, link: string }) {
  return (
    <Link to={link} className="equipment-card group hover:-translate-y-2">
      <div className="equipment-card-img-wrapper">
        <SafeImage src={img} className="w-full h-full object-cover saturate-[0.8] group-hover:saturate-100 transition-all duration-500" alt={title} />
      </div>
      <div className="equipment-card-body">
        <span className="equipment-tag">{tag}</span>
        <h3 className="text-xl font-semibold mb-4 text-primary">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}
