import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, Mountain, ArrowLeft, ExternalLink, CheckCircle2, Wind, Droplets, Sun, CloudRain, Cloud, AlertTriangle, Newspaper } from 'lucide-react';
import { routesData } from '../constants/routes';
import { MountainService } from '../services/mountainService';
import { cn } from '@/src/lib/utils';

/**
 * 路線詳細介紹頁面
 */
export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const [weather, setWeather] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 根據 ID 尋找對應路線資料
  const route = routesData.find(r => r.id === id);

  useEffect(() => {
    if (!route) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 並行獲取天氣與狀態
        const [weatherData, statusData] = await Promise.all([
          route.lat && route.lng ? MountainService.getRealtimeWeather(route.lat, route.lng) : null,
          MountainService.getHikingStatus(route.title)
        ]);

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

        setStatus(statusData);
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
            <h3 className="text-3xl font-serif font-bold text-primary mb-8 border-l-4 border-accent pl-6">建議行程 Itinerary</h3>
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

          {/* AI 即時狀態分析 */}
          {status && (
            <div className="bg-accent/5 p-10 rounded-2xl border border-accent/20">
              <div className="flex items-center gap-3 mb-6">
                <Newspaper className="text-accent" size={28} />
                <h3 className="text-2xl font-serif font-bold text-primary">AI 即時狀態分析</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-bold",
                    status.status?.includes('開放') ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {status.status || '未知'}
                  </span>
                  <span className="text-text-muted text-sm">資料來源：Gemini AI 即時檢索</span>
                </div>
                <div className="bg-white/50 p-6 rounded-xl">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-accent" /> 最新公告 / 況狀
                  </h4>
                  <p className="text-text-muted text-sm leading-relaxed">{status.notice}</p>
                </div>
                <div className="bg-white/50 p-6 rounded-xl">
                  <h4 className="font-bold text-primary mb-2">登山建議</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{status.advice}</p>
                </div>
              </div>
            </div>
          )}

          {/* 裝備建議連結 */}
          <div className="bg-primary p-12 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-serif font-bold mb-4">準備好出發了嗎？</h3>
              <p className="text-white/70 mb-8 max-w-[500px]">
                針對 {route.title} 的環境特性，我們為您整理了專屬的裝備清單與安全指南。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/preparation" className="bg-secondary text-primary px-8 py-3 rounded-full font-bold hover:bg-white transition-all">
                  查看裝備清單
                </Link>
                <Link to="/learning" className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all">
                  登山安全學堂
                </Link>
              </div>
            </div>
            <Mountain className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
          </div>
        </div>

        {/* 右側：側欄資訊 */}
        <div className="space-y-10">
          {/* 申請資訊 */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
            <h4 className="text-lg font-bold text-primary mb-6 tracking-widest uppercase border-b border-bg-base pb-4">入山申請資訊</h4>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent mt-1 flex-none" />
                <span className="text-sm text-text-muted">需申請入山證 (警政署)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent mt-1 flex-none" />
                <span className="text-sm text-text-muted">需申請入園證 (國家公園)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-accent mt-1 flex-none" />
                <span className="text-sm text-text-muted">山屋/營地需提前抽籤</span>
              </li>
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

          {/* 即時山區天氣 */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-bg-base pb-4">
              <h4 className="text-lg font-bold text-primary tracking-widest uppercase">即時山區天氣</h4>
              <a 
                href="https://www.cwa.gov.tw/V8/C/W/Mountain/Mountain.html" 
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
