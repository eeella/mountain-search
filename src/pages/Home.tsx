import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check, ArrowRight, Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, ExternalLink, Info, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { routesData } from '../constants/routes';
import { MountainService } from '../services/mountainService';

/**
 * 首頁組件，包含英雄區、搜尋功能、特色介紹與最新資訊
 */
export default function Home() {
  const [isSearching, setIsSearching] = useState(false); // 搜尋載入狀態
  const [region, setRegion] = useState(''); // 選擇的區域/山脈
  const [queryType, setQueryType] = useState(''); // 選擇的查詢項目
  const navigate = useNavigate();

  // 即時查詢結果（內嵌顯示）
  type WeatherInline = { kind: 'weather'; mountain: string; data: { temp: number; feel: number; status: string; rain: number; wind: number; humidity: number; code: number } };
  type InfoInline = { kind: 'info'; title: string; summary: string[]; source: { label: string; url: string } };
  const [inlineResult, setInlineResult] = useState<WeatherInline | InfoInline | null>(null);
  const [inlineError, setInlineError] = useState('');

  /**
   * 處理搜尋按鈕點擊
   * 將選擇的山脈映射到對應的路線 ID，並直接跳轉至該路線的攻略頁面
   */
  // 查詢項目「入園/步道/山屋」對應的官方資料來源（資料拉進頁面內，不開新頁）
  const officialSources: Record<string, { title: string; summary: string[]; source: { label: string; url: string } }> = {
    '入園抽籤狀態': {
      title: '入園抽籤狀態',
      summary: [
        '玉山、雪霸、太魯閣三大國家公園生態保護區皆需申請入園許可。',
        '一般採「出發日前 2 個月開放申請、1 個月前抽籤」，未中籤者可於公布後遞補。',
        '雪季 (1/2–3/31) 申請另有領隊、雪訓、人數上限等規範。',
        '所有申請均統一在「臺灣登山申請一站式服務網」辦理。',
      ],
      source: { label: '臺灣登山申請一站式服務網', url: 'https://hike.taiwan.gov.tw/notice_a1.aspx' },
    },
    '步道開放資訊': {
      title: '步道開放資訊',
      summary: [
        '玉山國家公園即時公告各步道封閉、管制與崩塌路況。',
        '近期常見：主峰線局部落石、八通關東段中斷、雪季管制等。',
        '出發前請務必查看「登山步道開放狀況」頁面。',
      ],
      source: { label: '玉山國家公園 登山步道開放狀況', url: 'https://www.ysnp.gov.tw/Trail/Status' },
    },
    '山屋剩餘床位': {
      title: '山屋剩餘床位',
      summary: [
        '排雲、嘉明湖、九九、天池等熱門山屋皆採抽籤制。',
        '可在「一站式服務網」即時查看每日剩餘床位與遞補狀態。',
        '建議於開放申請第一週送件，並備好備案路線。',
      ],
      source: { label: '臺灣登山申請一站式服務網 山屋床位', url: 'https://hike.taiwan.gov.tw/bed_1.aspx' },
    },
  };

  const handleSearch = async () => {
    const mountainName =
      region && region !== '請選擇欲前往的路線' ? region.split(' (')[0] : null;

    // 1) 即時天氣預報 → 內嵌取得 Open-Meteo 即時資料
    if (queryType === '即時天氣預報') {
      if (!mountainName) {
        setInlineError('請先選擇要查詢的山岳');
        setInlineResult(null);
        return;
      }
      const route = routesData.find(r => r.title === mountainName);
      if (!route || route.lat === undefined || route.lng === undefined) {
        setInlineError('該山岳尚無座標資料');
        setInlineResult(null);
        return;
      }
      setInlineError('');
      setIsSearching(true);
      setInlineResult(null);
      try {
        const data = await MountainService.getRealtimeWeather(route.lat, route.lng);
        if (data) {
          setInlineResult({ kind: 'weather', mountain: mountainName, data });
        } else {
          setInlineError('天氣資料暫時無法取得，請稍後再試');
        }
      } catch {
        setInlineError('天氣資料暫時無法取得，請稍後再試');
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // 2) 入園 / 步道 / 山屋 → 內嵌官方資料摘要
    const info = officialSources[queryType];
    if (info) {
      setInlineError('');
      setInlineResult({ kind: 'info', title: info.title, summary: info.summary, source: info.source });
      return;
    }

    // 3) 預設：帶到 /explore，搜尋面板自動帶入山岳
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (mountainName) {
        navigate(`/explore?q=${encodeURIComponent(mountainName)}`);
        return;
      }
      navigate('/explore');
    }, 600);
  };

  const getWeatherIcon = (code: number, size = 22) => {
    if (code === 0 || code === 1) return <Sun size={size} />;
    if ([2, 3, 45, 48].includes(code)) return <Cloud size={size} />;
    if (code >= 51 && code <= 99) return <CloudRain size={size} />;
    return <Cloud size={size} />;
  };

  // 登山遊記資料：使用真實分享者與健行筆記連結 (經人工核對)
  const journeys = [
    { tag: '新手必讀', title: '合歡北峰：丁小羽的百岳初體驗，最親民的絕美稜線', author: '丁小羽', rating: 5, img: 'https://upload.wikimedia.org/wikipedia/commons/3/37/%E5%90%88%E6%AD%A1%E7%BE%A4%E5%B3%B0.JPG', url: 'https://feather428.pixnet.net/blog/post/350523877' },
    { tag: '經典路線', title: '雪山主東峰：搭公車說走就走的入門新手級百岳', author: '健行筆記', rating: 5, img: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/HsuehMountain.jpg', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=23601' },
    { tag: '夢幻秘境', title: '松羅湖兩天一夜：美麗的十七歲少女之湖', author: 'Melissa 山女孩', rating: 5, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/SongLuo_Lake%2C_Ivan_Tsung-Yi_Lin%2C_004.jpg/1280px-SongLuo_Lake%2C_Ivan_Tsung-Yi_Lin%2C_004.jpg', url: 'https://melissalin510.pixnet.net/blog/posts/15310812476' },
    { tag: '帝王之山', title: '南湖大山：山女孩 Kit 的圈谷晨光', author: '山女孩 Kit', rating: 5, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/NanhuMountain_02.jpg/1280px-NanhuMountain_02.jpg', url: 'https://kitfangcom.wordpress.com/2018/05/03/南湖大山/' },
    { tag: '黃金草原', title: '奇萊南華 — 郊遊度假首選', author: '健行筆記', rating: 5, img: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/ChiLaiSouthPeak.jpg', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=15071' }
  ];

  return (
    <div className="flex flex-col">
      {/* 全域質感疊加層 */}
      <div className="texture-overlay" />

      {/* 英雄區 (Hero Section) */}
      <section className="hero-section">
        <div
          className="hero-bg"
          style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/%E9%98%BF%E9%87%8C%E5%B1%B1%E6%97%A5%E5%87%BA%E8%88%87%E9%9B%B2%E6%B5%B7.jpg/3840px-%E9%98%BF%E9%87%8C%E5%B1%B1%E6%97%A5%E5%87%BA%E8%88%87%E9%9B%B2%E6%B5%B7.jpg')" }}
        />
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            開啟未知，探索極致
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-subtitle"
          >
            輸入山脈，氣候與入山狀態一目了然
          </motion.p>
          
          {/* 搜尋框組件 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="search-container"
          >
            <div className="bg-bg-base shadow-2xl border border-bg-base overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch">
              {/* 區域/山脈選擇 */}
              <div className="search-field">
                <label className="search-label">區域 / 山脈</label>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="search-select"
                >
                  <option>請選擇欲前往的路線</option>
                  <option>玉山主峰 (3,952m)</option>
                  <option>雪山主峰 (3,886m)</option>
                  <option>中央尖山 (3,705m)</option>
                  <option>合歡北峰 (3,422m)</option>
                  <option>大霸尖山 (3,492m)</option>
                </select>
              </div>
              {/* 查詢項目選擇 */}
              <div className="search-field">
                <label className="search-label">查詢項目</label>
                <select 
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  className="search-select"
                >
                  <option>天氣預報 / 抽籤 / 封山</option>
                  <option>即時天氣預報</option>
                  <option>入園抽籤狀態</option>
                  <option>步道開放資訊</option>
                  <option>山屋剩餘床位</option>
                </select>
              </div>
              {/* 搜尋按鈕 */}
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="search-button"
              >
                {isSearching ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Search size={20} />
                  </motion.div>
                ) : <Search size={20} />}
                {isSearching ? '搜尋中...' : '開始探索'}
              </button>
            </div>
            {/* 內嵌查詢結果：與搜尋框同一面板，加分隔線分區 */}
            <AnimatePresence>
              {(inlineResult || inlineError) && (
                <motion.div
                  key={inlineResult ? (inlineResult.kind === 'weather' ? `w-${inlineResult.mountain}` : `i-${inlineResult.title}`) : 'err'}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-border bg-white"
                >
                  <div className="flex items-center justify-between px-6 py-3 bg-bg-base/60 border-b border-border">
                    <span className="text-xs font-bold tracking-widest uppercase text-primary">查詢結果</span>
                    <button
                      type="button"
                      onClick={() => { setInlineResult(null); setInlineError(''); }}
                      className="text-text-muted hover:text-primary transition-colors"
                      aria-label="關閉"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {inlineError && (
                    <div className="px-6 py-5 text-sm text-red-600 flex items-center gap-2">
                      <Info size={14} /> {inlineError}
                    </div>
                  )}

                  {inlineResult && inlineResult.kind === 'weather' && (
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-text-muted tracking-widest uppercase mb-3">
                        <MapPin size={12} className="text-accent" /> {inlineResult.mountain}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-primary to-primary/85 text-white">
                          <div className="flex items-center gap-4">
                            <div className="text-accent">{getWeatherIcon(inlineResult.data.code, 30)}</div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-bold leading-none">{inlineResult.data.temp}°</span>
                              <span className="text-white/70 text-xs">體感 {inlineResult.data.feel}°</span>
                            </div>
                          </div>
                          <div className="mt-3 inline-block px-3 py-1 bg-white/10 rounded-full text-[0.7rem] tracking-widest">
                            {inlineResult.data.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-4 rounded-xl bg-bg-base border border-border">
                            <div className="flex items-center gap-1.5 text-text-muted text-[0.65rem] uppercase tracking-widest mb-1.5"><Droplets size={11} /> 降雨</div>
                            <p className="text-xl font-bold text-primary">{inlineResult.data.rain}<span className="text-xs font-normal">%</span></p>
                          </div>
                          <div className="p-4 rounded-xl bg-bg-base border border-border">
                            <div className="flex items-center gap-1.5 text-text-muted text-[0.65rem] uppercase tracking-widest mb-1.5"><Wind size={11} /> 風速</div>
                            <p className="text-xl font-bold text-primary">{inlineResult.data.wind}<span className="text-xs font-normal"> km/h</span></p>
                          </div>
                          <div className="p-4 rounded-xl bg-bg-base border border-border">
                            <div className="flex items-center gap-1.5 text-text-muted text-[0.65rem] uppercase tracking-widest mb-1.5"><Thermometer size={11} /> 濕度</div>
                            <p className="text-xl font-bold text-primary">{inlineResult.data.humidity}<span className="text-xs font-normal">%</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[0.7rem] text-text-muted">
                        <span>資料來源：Open-Meteo Real-time API</span>
                        <Link to={`/weather?q=${encodeURIComponent(inlineResult.mountain)}`} className="text-accent font-bold inline-flex items-center gap-1 hover:underline">
                          查看完整氣象地圖 <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {inlineResult && inlineResult.kind === 'info' && (
                    <div className="p-6">
                      <h3 className="font-sans text-xl font-extrabold tracking-wide text-primary mb-3">{inlineResult.title}</h3>
                      <ul className="space-y-2 mb-4">
                        {inlineResult.summary.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-muted leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-none" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={inlineResult.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
                      >
                        <ExternalLink size={14} /> {inlineResult.source.label}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>

          {/* 快速資訊標籤 */}
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap mt-10">
            {['多日天氣預報', '營位抽籤狀態', '步道封閉資訊'].map((text, i) => (
              <motion.span 
                key={text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                className="quick-info-tag"
              >
                {text}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* 專屬探索區 (Editorial Feature) */}
      <section className="editorial-section">
        <div className="editorial-divider" />
        <div className="editorial-container">
          <div className="flex-1 lg:pr-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="editorial-badge-num">01</span>
              <span className="editorial-badge-text">Explore</span>
            </div>
            <h2 className="editorial-title">
              專屬您的<br />巔峰起點
            </h2>
          </div>

          <div className="flex-none relative group">
            <div className="editorial-image-wrapper group-hover:-translate-y-2">
              <img 
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop" 
                alt="專屬探索" 
                className="editorial-image group-hover:scale-110"
              />
            </div>
          </div>

          <div className="flex-1 lg:pl-20">
            <p className="editorial-desc">
              不知道該去哪裡？依據您的體能與經驗，為您精選最合適的路線。捨去迷惘，讓每一次起步都優雅且安穩。
            </p>
            <ul className="mb-10 space-y-4">
              {['精準評估體能狀況與經驗', '擺脫大眾路線，發掘私房秘境'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-bg-base/70 font-normal tracking-wide">
                  <span className="w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-[0.6rem]">
                    <Check size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/explore" className="border-b border-secondary text-secondary pb-2 font-semibold text-lg hover:text-accent hover:border-accent transition-all duration-300 inline-flex items-center gap-3 uppercase tracking-widest">
              探索專屬路線 <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 準備步驟區 (Steps Section) */}
      <section className="steps-section">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="steps-title">Preparation</h2>
            <p className="steps-subtitle">簡單 3 步，說走就走</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1100px] mx-auto">
            {[
              { step: '01', title: '尋找路線', desc: '依據體能篩選最佳路線，從郊山到百岳不再迷惘', img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600', path: '/explore' },
              { step: '02', title: '裝備打包', desc: '參考職人級輕量化清單，帶足必備救命裝備', img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=600', offset: true, path: '/preparation' },
              { step: '03', title: '安心出發', desc: '行前確認氣候與入山申請，享受自然的靜謐', img: 'https://images.unsplash.com/photo-1506905925206-3848b53e77f2?q=80&w=600', path: '/learning' }
            ].map((item, i) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className={cn("group cursor-pointer", item.offset && "md:mt-20")}
              >
                <Link to={item.path}>
                  <div className="step-card-wrapper group-hover:-translate-y-2">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover saturate-[0.8] contrast-[1.05] transition-transform duration-1000 group-hover:scale-110" />
                    <div className="step-card-overlay">
                      <span className="step-number">Step {item.step}</span>
                      <h3 className="step-title">{item.title}</h3>
                      <p className="text-bg-base/80 text-sm font-light leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 登山遊記區 (Journeys Section) */}
      <section className="journeys-section">
        <div className="max-w-[1240px] mx-auto px-6 mb-20">
          <div className="text-center">
            <h2 className="text-[2.8rem] font-medium text-text-dark mb-4 tracking-[0.15em] uppercase font-serif">Journeys</h2>
            <p className="text-accent text-base font-medium tracking-[0.15em] uppercase">閱讀他人的足跡，規劃下一次旅程</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[1200px] md:h-[600px] gap-4 w-full max-w-[1400px] mx-auto px-6">
          {journeys.map((item, i) => (
            <a 
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="journey-card group hover:flex-[6]"
            >
              <img 
                src={item.img} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800";
                }}
              />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-serif text-2xl font-medium [writing-mode:vertical-rl] tracking-[0.2em] whitespace-nowrap z-10 group-hover:opacity-0 transition-opacity duration-300">
                {item.title.split('：')[0]}
              </div>
              <div className="journey-card-overlay group-hover:opacity-100 translate-y-5 group-hover:translate-y-0">
                <span className="self-start bg-accent text-white px-4 py-1.5 text-[0.75rem] font-semibold tracking-[0.15em] uppercase mb-4">{item.tag}</span>
                <h3 className="font-serif text-3xl font-medium mb-4 leading-tight text-white">{item.title}</h3>
                <div className="flex items-center gap-6 border-t border-white/20 pt-6 max-w-[600px]">
                  <span className="text-sm font-medium text-white tracking-widest uppercase">{item.author}</span>
                  <span className="text-accent text-sm tracking-[2px]">{'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 最新公告與指南區 (News Section) */}
      <section className="news-section">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-20 items-start">
          {/* 官方公告 */}
          <div className="notice-card lg:sticky lg:top-32">
            <h3 className="font-serif text-[2.8rem] leading-tight mb-12 border-b border-border pb-6 tracking-widest uppercase">Official Notice</h3>
            <div className="space-y-8">
              {[
                { tag: '活動', date: '2026.04.01', text: '玉山國家公園：最新新聞快訊與活動公告一覽。', url: 'https://www.ysnp.gov.tw/Announcement/C001000' },
                { tag: '路況', date: '2026.03.25', text: '玉山國家公園：登山步道開放狀況，出發前請務必查詢。', url: 'https://www.ysnp.gov.tw/Trail/Status' },
                { tag: '入園', date: '2026.03.20', text: '雪霸國家公園登山須知：雪季入園管制與山屋申請說明。', url: 'https://hike.taiwan.gov.tw/notice_a7.aspx' }
              ].map((news, i) => (
                <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" className="block border-b border-border last:border-none pb-8 last:pb-0 hover:pl-4 hover:bg-black/5 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="notice-tag">{news.tag}</span>
                    <span className="text-text-muted font-serif text-[0.95rem]">{news.date}</span>
                  </div>
                  <p className="text-xl font-light leading-relaxed text-text-dark font-serif">{news.text}</p>
                </a>
              ))}
            </div>
          </div>
          
          {/* 行前指南與山系介紹 */}
          <div className="pt-6">
            <h3 className="font-serif text-[2.2rem] text-text-dark mb-10 tracking-widest uppercase">Mountain Systems & Guides</h3>
            <div className="space-y-0">
              {[
                { title: '中央山脈：台灣的屋脊', url: 'https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%A4%AE%E5%B1%B1%E8%84%88' },
                { title: '雪山山脈：冰河遺留的壯麗', url: 'https://zh.wikipedia.org/wiki/%E9%9B%AA%E5%B1%B1%E5%B1%B1%E8%84%88' },
                { title: '玉山山脈：東北亞最高之巔', url: 'https://www.ysnp.gov.tw/StaticPage/Terrain' },
                { title: '阿里山山脈：雲海與森林鐵道', url: 'https://recreation.forest.gov.tw/Forest/RA?typ_id=0500001' },
                { title: '海岸山脈：太平洋畔的翠綠', url: 'https://www.eastcoast-nsa.gov.tw/zh-tw/travel/geography/' },
                { title: '百岳入門指南：第一座該選誰？', path: '/learning' },
                { title: '一日郊山與多日縱走 裝備檢查表', path: '/preparation' }
              ].map((item, i) => (
                item.path ? (
                  <Link key={i} to={item.path} className="flex justify-between items-center py-8 border-b border-border first:border-t hover:px-6 hover:border-accent hover:bg-white transition-all duration-300 group">
                    <span className="text-xl font-medium text-primary group-hover:text-accent transition-colors tracking-widest font-serif">{item.title}</span>
                    <span className="text-accent text-2xl font-light group-hover:translate-x-2 transition-transform font-serif">➔</span>
                  </Link>
                ) : (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center py-8 border-b border-border first:border-t hover:px-6 hover:border-accent hover:bg-white transition-all duration-300 group">
                    <span className="text-xl font-medium text-primary group-hover:text-accent transition-colors tracking-widest font-serif">{item.title}</span>
                    <span className="text-accent text-2xl font-light group-hover:translate-x-2 transition-transform font-serif">➔</span>
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
