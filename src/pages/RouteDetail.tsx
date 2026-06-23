import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, Mountain, ArrowLeft, ChevronDown, ExternalLink, CheckCircle2, Wind, Droplets, Sun, CloudRain, Cloud, Download, FileText } from 'lucide-react';
import { routesData } from '../constants/routes';
import { MountainService } from '../services/mountainService';
import { cn } from '@/src/lib/utils';

/**
 * 路線詳細介紹頁面
 */
export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const [weather, setWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 登山計畫書內嵌區塊：就地展開，並依 iframe 內容自動撐高（與本站同源）
  const [showPlan, setShowPlan] = useState(false);
  const [planHeight, setPlanHeight] = useState(1400);
  const planIframeRef = useRef<HTMLIFrameElement>(null);
  const planRoRef = useRef<ResizeObserver | null>(null);

  const syncPlanHeight = () => {
    try {
      const doc = planIframeRef.current?.contentDocument;
      if (doc) setPlanHeight(doc.documentElement.scrollHeight);
    } catch { /* 跨來源時略過 */ }
  };

  const handlePlanLoad = () => {
    syncPlanHeight();
    try {
      const body = planIframeRef.current?.contentDocument?.body;
      if (body && 'ResizeObserver' in window) {
        planRoRef.current?.disconnect();
        planRoRef.current = new ResizeObserver(syncPlanHeight);
        planRoRef.current.observe(body);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => () => planRoRef.current?.disconnect(), []);

  // 根據 ID 尋找對應路線資料
  const route = routesData.find(r => r.id === id);

  useEffect(() => {
    if (!route) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 獲取即時天氣
        const weatherData = route.lat && route.lng
          ? await MountainService.getRealtimeWeather(route.lat, route.lng)
          : null;

        if (weatherData) {
          const icons: Record<number, any> = {
            0: <Sun size={24} />,
            1: <Sun size={24} />,
            2: <Cloud size={24} />,
            3: <Cloud size={24} />,
            61: <CloudRain size={24} />,
            80: <CloudRain size={24} />,
            95: <CloudRain size={24} />,
          };
          setWeather({
            ...weatherData,
            icon: icons[weatherData.code] || <Cloud size={24} />
          });
        }
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, route]);

  if (!route) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-10">
        <h2 className="text-3xl font-serif text-primary mb-4">找不到該路線資訊</h2>
        <Link to="/explore" className="text-accent font-bold hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> 返回探索頁面
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-bg-base min-h-screen">
      {/* 英雄區：大圖背景 */}
      <section className="relative h-[60vh] flex items-end overflow-hidden">
        <img 
          src={route.img} 
          alt={route.title} 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="max-w-[1240px] mx-auto px-8 w-full pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/explore" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors tracking-widest text-sm uppercase">
              <ArrowLeft size={16} /> Back to Explore
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-accent text-white px-4 py-1 text-[0.7rem] font-bold tracking-widest uppercase rounded-sm">
                {route.level}
              </span>
              <span className="text-white/80 flex items-center gap-1 text-sm tracking-widest uppercase">
                <MapPin size={14} /> {route.region}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight mb-4">
              {route.title}
            </h1>
            <p className="text-xl text-white/90 max-w-[600px] font-light leading-relaxed">
              {route.desc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 內容區 */}
      <section className="py-24 max-w-[1240px] mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-20">
        {/* 左側：詳細資訊 */}
        <div className="space-y-16">
          {/* 核心數據 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-10 rounded-2xl shadow-sm border border-border">
            <div className="space-y-1">
              <span className="text-[0.65rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40 flex items-center gap-1">
                <Mountain size={12} /> 海拔高度
              </span>
              <p className="text-2xl font-bold text-primary">{route.elevation || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[0.65rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40 flex items-center gap-1">
                <MapPin size={12} /> 總里程
              </span>
              <p className="text-2xl font-bold text-primary">{route.distance || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[0.65rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40 flex items-center gap-1">
                <Clock size={12} /> 預計天數
              </span>
              <p className="text-2xl font-bold text-primary">{route.duration || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[0.65rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-40 flex items-center gap-1">
                <Calendar size={12} /> 最佳季節
              </span>
              <p className="text-2xl font-bold text-primary">{route.bestSeason || 'N/A'}</p>
            </div>
          </div>

          {/* 建議行程 */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-8">
              <h3 className="text-3xl font-serif font-bold text-primary border-l-4 border-accent pl-6">建議行程 Itinerary</h3>
              <button
                type="button"
                onClick={() => setShowPlan(v => !v)}
                aria-expanded={showPlan}
                className="flex-none inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-accent transition-colors"
              >
                <FileText size={16} /> 登山計畫書
                <ChevronDown size={16} className={cn('transition-transform', showPlan && 'rotate-180')} />
              </button>
            </div>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {route.itinerary?.map((item, idx) => (
                <div key={idx} className="flex gap-6 relative">
                  <div className="w-6 h-6 rounded-full bg-white border-4 border-accent z-10 flex-none mt-1" />
                  <div className="bg-white p-6 rounded-xl border border-border flex-1 shadow-sm hover:border-accent transition-colors">
                    <p className="text-primary font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              )) || <p className="text-text-muted italic">暫無詳細行程資料</p>}
            </div>
          </div>

          {/* 登山計畫書：由「建議行程」標題旁按鈕切換。展開時直接顯示工具本體，
              其自身的深色工具列即為唯一標頭（書名／檔案大小／按鈕／操作說明全在同一條） */}
          {showPlan && (
            <div className="rounded-2xl overflow-hidden">
              <iframe
                ref={planIframeRef}
                onLoad={handlePlanLoad}
                src={`${import.meta.env.BASE_URL}hiking-plan/index.html`}
                title="登山計畫書"
                className="w-full block border-0"
                style={{ height: planHeight }}
              />
            </div>
          )}

          {/* 專屬裝備建議：依路線海拔/天數/季節動態組合 */}
          {(() => {
            const elevNum = parseInt((route.elevation || '0').replace(/[^0-9]/g, ''));
            const isMultiDay = /天/.test(route.duration || '');
            const isHigh = elevNum >= 3000;
            const isVeryHigh = elevNum >= 3500;
            const isWinter = /雪|冬|1月|2月|3月|12月/.test(route.bestSeason || '');
            const isTechnical = route.level === '專家級' || /岩|尖|稜/.test(route.title);

            const categories: { name: string; tag: string; items: string[] }[] = [];

            categories.push({
              name: '必備裝備', tag: '所有路線',
              items: ['登山背包（含背包套）', '登山鞋（中高筒、防水）', '排汗襪 ×2', '登山杖', '頭燈（含備用電池）', '急救包與個人藥品', '哨子、鋁箔求生毯', '行動電源、離線地圖'],
            });

            const clothing = ['排汗衣（底層）', '保暖衣（中層）', '防水防風外套（外層）', '登山褲', '毛帽/遮陽帽', '手套'];
            if (isHigh) clothing.push('羽絨外套（800FP+）', '保暖頭套');
            if (isVeryHigh) clothing.push('厚保暖手套', '備用保暖衣');
            categories.push({ name: '衣物穿著', tag: isVeryHigh ? '高海拔加強' : isHigh ? '高山保暖' : '一般', items: clothing });

            const food = ['飲水 2L+', '行動糧（高熱量）'];
            if (isMultiDay) food.push('正餐（早晚 × 天數）', '攻頂爐 + 瓦斯', '個人餐具');
            else food.push('午餐（飯糰/麵包）');
            categories.push({ name: '食物飲水', tag: isMultiDay ? '多日縱走' : '單日往返', items: food });

            if (isMultiDay) {
              categories.push({
                name: '過夜裝備', tag: '山屋/紮營',
                items: ['睡袋（' + (isHigh ? '-10°C 適用' : '5°C 適用') + '）', '睡墊', '換洗衣物', '盥洗用品', '頭燈備用電池'],
              });
            }

            if (isHigh) {
              categories.push({
                name: '高山專屬', tag: `${elevNum}m`,
                items: ['丹木斯（高山症預防，需先諮詢醫師）', '葡萄糖/巧克力補給', 'SPF50+ 防曬乳', '太陽眼鏡（UV400）', '保溫瓶'],
              });
            }

            if (isWinter && isHigh) {
              categories.push({
                name: '雪季專屬', tag: '冬季管制',
                items: ['12 齒冰爪', '冰斧（含腕帶）', '攀登頭盔', '雪攀手套', '雪鏡/護目鏡', '完成雪訓證明'],
              });
            }

            if (isTechnical) {
              categories.push({
                name: '技術裝備', tag: '岩稜/技術段',
                items: ['攀登安全帽', '吊帶 + 確保器', '主繩（30m+）', '耐磨手套', '無線電對講機'],
              });
            }

            categories.push({
              name: '證件文件', tag: '出發前確認',
              items: ['身分證正本', '入山/入園許可證（紙本）', '健保卡', '少量現金 + 悠遊卡', '緊急聯絡資訊卡'],
            });

            return (
              <div className="bg-primary p-8 md:p-12 rounded-2xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold">{route.title} 專屬裝備清單</h3>
                    <span className="text-[0.7rem] text-white/50 tracking-widest uppercase">
                      依海拔 {route.elevation || '—'} · {route.duration || '—'} · {route.bestSeason || '—'} 推薦
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-8 max-w-[680px] leading-relaxed">
                    系統根據此路線特性（高山/雪季/多日/技術）自動勾選必要分類，務必出發前逐項確認。標
                    <span className="text-accent font-bold">紅色</span>者為僅特定條件才出現的進階裝備。
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => {
                      const isExtra = ['高山專屬', '雪季專屬', '技術裝備', '過夜裝備'].includes(cat.name);
                      return (
                        <div key={cat.name} className={cn(
                          "bg-white/5 backdrop-blur-sm p-5 rounded-xl border",
                          isExtra ? "border-accent/40" : "border-white/10"
                        )}>
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                            <h4 className={cn("font-bold tracking-wide", isExtra ? "text-accent" : "text-white")}>{cat.name}</h4>
                            <span className="text-[0.6rem] text-white/40 tracking-widest uppercase">{cat.tag}</span>
                          </div>
                          <ul className="space-y-2">
                            {cat.items.map((it) => (
                              <li key={it} className="flex items-start gap-2 text-xs text-white/80 leading-relaxed">
                                <CheckCircle2 size={12} className={cn("mt-0.5 flex-none", isExtra ? "text-accent" : "text-white/50")} />
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                    <Link to="/preparation" className="bg-secondary text-primary px-6 py-3 rounded-full text-sm font-bold hover:bg-white transition-all inline-flex items-center gap-2">
                      <CheckCircle2 size={14} /> 互動式清單與列印
                    </Link>
                    <Link to="/learning" className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full text-sm font-bold hover:bg-white/20 transition-all">
                      登山安全學堂
                    </Link>
                  </div>
                </div>
                <Mountain className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
              </div>
            );
          })()}
        </div>

        {/* 右側：側欄資訊 */}
        <div className="space-y-10">
          {/* 申請資訊 */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
            <h4 className="text-lg font-bold text-primary mb-6 tracking-widest uppercase border-b border-bg-base pb-4">入山申請資訊</h4>
            <ul className="space-y-3 mb-8">
              {[
                { text: '需申請入山證 (警政署)', url: 'https://www.7spc.npa.gov.tw/ch/app/data/view?module=wg103&id=2779&serno=512221b6-34f0-4390-9b75-b461c1fea44c' },
                { text: '需申請入園證 (國家公園)', url: 'https://hike.taiwan.gov.tw/notice_a1.aspx' },
                { text: '山屋/營地需提前抽籤', url: 'https://hike.taiwan.gov.tw/bed_1.aspx' },
              ].map((item) => (
                <li key={item.text}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-bg-base/60 transition-colors group"
                  >
                    <CheckCircle2 size={18} className="text-accent mt-1 flex-none" />
                    <span className="text-sm text-text-muted group-hover:text-primary transition-colors flex-1">{item.text}</span>
                    <ExternalLink size={12} className="text-text-muted/50 group-hover:text-accent mt-1.5 flex-none transition-colors" />
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="https://hike.taiwan.gov.tw/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all"
            >
              前往官方申請系統 <ExternalLink size={16} />
            </a>
          </div>

          {/* GPX 軌跡下載 */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
            <h4 className="text-lg font-bold text-primary mb-6 tracking-widest uppercase border-b border-bg-base pb-4">GPX 軌跡下載</h4>
            <ul className="space-y-3 mb-8">
              {[
                { text: `健行筆記：${route.title} GPX 搜尋`, url: `https://hiking.biji.co/index.php?q=trail&keyword=${encodeURIComponent(route.title)}` },
                { text: 'Hikingbook 路線資料庫', url: `https://hikingbook.net/zh-TW/trails?query=${encodeURIComponent(route.title)}` },
                { text: '上河文化《高山百岳地形圖》', url: 'https://www.sunriver.com.tw/' },
              ].map((item) => (
                <li key={item.text}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-bg-base/60 transition-colors group"
                  >
                    <CheckCircle2 size={18} className="text-accent mt-1 flex-none" />
                    <span className="text-sm text-text-muted group-hover:text-primary transition-colors flex-1">{item.text}</span>
                    <ExternalLink size={12} className="text-text-muted/50 group-hover:text-accent mt-1.5 flex-none transition-colors" />
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`https://hiking.biji.co/index.php?q=trail&keyword=${encodeURIComponent(route.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-accent transition-all"
            >
              下載 {route.title} GPX <Download size={16} />
            </a>
            <p className="text-[0.7rem] text-text-muted/70 mt-4 leading-relaxed">
              GPX 軌跡是參考，請搭配最新路況、紙本地圖、指北針交叉確認。
            </p>
          </div>

          {/* 即時山區天氣 */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-bg-base pb-4">
              <h4 className="text-lg font-bold text-primary tracking-widest uppercase">即時山區天氣</h4>
              <a 
                href="https://www.cwa.gov.tw/V8/C/W/OBS_Map.html"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[0.65rem] text-accent font-bold hover:underline flex items-center gap-1"
              >
                氣象署官網 <ExternalLink size={10} />
              </a>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center py-10 space-y-4">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-text-muted">正在獲取即時數據...</p>
              </div>
            ) : weather ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-bg-base rounded-full flex items-center justify-center text-accent">
                      {weather.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{weather.temp}°C</p>
                      <p className="text-xs text-text-muted">體感溫度 {weather.feel}°C</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[0.7rem] font-bold",
                    weather.status.includes('晴') ? "bg-emerald-100 text-emerald-700" : 
                    weather.status.includes('雲') ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {weather.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-bg-base p-3 rounded-lg">
                    <p className="text-[0.6rem] text-text-muted mb-1">降雨機率</p>
                    <p className="text-sm font-bold text-primary">{weather.rain}%</p>
                  </div>
                  <div className="bg-bg-base p-3 rounded-lg">
                    <p className="text-[0.6rem] text-text-muted mb-1">風速</p>
                    <p className="text-sm font-bold text-primary">{weather.wind}km/h</p>
                  </div>
                  <div className="bg-bg-base p-3 rounded-lg">
                    <p className="text-[0.6rem] text-text-muted mb-1">濕度</p>
                    <p className="text-sm font-bold text-primary">{weather.humidity}%</p>
                  </div>
                </div>
                <p className="text-[0.6rem] text-text-muted italic text-center">* 數據來源：Open-Meteo Real-time API</p>
              </>
            ) : (
              <p className="text-sm text-text-muted text-center py-10">暫時無法獲取天氣數據</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
