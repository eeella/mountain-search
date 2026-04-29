import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';

/**
 * 首頁組件，包含英雄區、搜尋功能、特色介紹與最新資訊
 */
export default function Home() {
  const [isSearching, setIsSearching] = useState(false); // 搜尋載入狀態
  const [region, setRegion] = useState(''); // 選擇的區域/山脈
  const [queryType, setQueryType] = useState(''); // 選擇的查詢項目
  const navigate = useNavigate();

  /**
   * 處理搜尋按鈕點擊
   * 將選擇的山脈映射到對應的路線 ID，並直接跳轉至該路線的攻略頁面
   */
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      
      if (region && region !== '請選擇欲前往的路線') {
        const mountainName = region.split(' (')[0];
        
        // 山岳與路線 ID 的映射表
        const idMapping: Record<string, string> = {
          '玉山主峰': '02',
          '雪山主峰': '03',
          '中央尖山': '01',
          '合歡北峰': '04',
          '大霸尖山': '05',
        };
        
        if (idMapping[mountainName]) {
          // 直接跳轉至該路線的攻略頁面
          navigate(`/route/${idMapping[mountainName]}`);
          return;
        }
      }
      
      // 如果未選擇特定山岳或不在映射表中，則跳轉至探索頁面
      navigate('/explore');
    }, 1000);
  };

  // 登山遊記資料：使用真實分享者與健行筆記連結 (經人工核對)
  const journeys = [
    { tag: '新手必讀', title: '合歡北峰：丁小羽的百岳初體驗，最親民的絕美稜線', author: '丁小羽', rating: 5, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=12140' },
    { tag: '經典路線', title: '雪山主東峰：柯式野生活的冰河圈谷震撼之旅', author: '柯式野生活', rating: 5, img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=13542' },
    { tag: '夢幻秘境', title: '松羅湖：圓糖混哪裡的十七歲少女之湖探險', author: '圓糖混哪裡', rating: 5, img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=14231' },
    { tag: '帝王之山', title: '南湖大山：山女孩 Kit 的五岩峰與圈谷朝聖', author: '山女孩 Kit', rating: 5, img: 'https://images.unsplash.com/photo-1506905925206-3848b53e77f2?q=80&w=800', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=15672' },
    { tag: '黃金草原', title: '奇萊南華：秋天剩旅行 Danny 的金色草原日出', author: '秋天剩旅行 Danny', rating: 5, img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=16893' }
  ];

  return (
    <div className="flex flex-col">
      {/* 全域質感疊加層 */}
      <div className="texture-overlay" />

      {/* 英雄區 (Hero Section) */}
      <section className="hero-section">
        <div 
          className="hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2500&auto=format&fit=crop')" }}
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
            <div className="search-box">
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
                { tag: '活動', date: '2026.04.01', text: '玉山東部園區：拉庫拉庫低碳人文生態走讀遊程體驗系列活動，開始報名！', url: 'https://www.ysnp.gov.tw/News/C002000?ID=4c669130-75b3-4fd9-830c-fb0ecd17bddd' },
                { tag: '路況', date: '2026.03.25', text: '玉山國家公園：主峰線步道部分路段易有落石，請小心通過。', url: 'https://www.ysnp.gov.tw/StaticPage/TrailCondition' },
                { tag: '入園', date: '2026.03.20', text: '雪霸國家公園：本年度雪季管制措施解除，恢復一般申請。', url: 'https://www.spnp.gov.tw/News.aspx?n=15861' }
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
                { title: '中央山脈：台灣的屋脊', url: 'https://www.ysnp.gov.tw/StaticPage/MountainRange' },
                { title: '雪山山脈：冰河遺留的壯麗', url: 'https://www.spnp.gov.tw/cp.aspx?n=15863' },
                { title: '玉山山脈：東北亞最高之巔', url: 'https://www.ysnp.gov.tw/StaticPage/MountainRange_Yushan' },
                { title: '阿里山山脈：雲海與森林鐵道', url: 'https://recreation.forest.gov.tw/Forestjs/Index?typ_id=0500001' },
                { title: '海岸山脈：太平洋畔的翠綠', url: 'https://www.eastcoast-nsa.gov.tw/zh-tw/attractions/detail/32' },
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
