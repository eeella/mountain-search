import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Star, ChevronLeft, ChevronRight, Info, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 登山學堂頁面組件，包含知識分類、登山診斷工具、行前檢查與社群分享
 */
export default function Learning() {
  const [step, setStep] = useState(1); // 診斷工具的當前步驟
  const [answers, setAnswers] = useState<Record<number, string>>({}); // 儲存診斷回答
  const [showResult, setShowResult] = useState(false); // 是否顯示診斷結果
  const carouselRef = useRef<HTMLDivElement>(null); // 社群分享輪播的引用

  // 診斷工具的問題配置
  const questions = [
    {
      id: 1,
      q: "您過去一年進行登山或健行的次數是？",
      options: ['我是全新手', '1-3 次，偶爾會跟朋友去爬', '5 次以上，我有豐富登山經驗', '幾乎每月都爬，我是登山愛好者']
    },
    {
      id: 2,
      q: "您過去的登山經驗，主要路線屬於哪一類？",
      options: ['平緩的親山步道（如大坑步道、象山）', '中級山或稍具坡度的步道（如東滿步道、加里山）', '兩天一夜的入門百岳（如玉山、合歡山）', '完全沒有經驗']
    },
    {
      id: 3,
      q: "您對於負重能力的自評是？",
      options: ['輕量化（5kg 以下）', '一般負重（5-10kg）', '重裝（10-15kg 以上）', '完全沒概念']
    },
    {
      id: 4,
      q: "您是否具備基本的離線地圖使用能力？",
      options: ['是的，我會使用 GPX 導航', '聽過但不太會用', '完全不會，都看指標', '我只去有明確指標的熱門路線']
    },
    {
      id: 5,
      q: "您偏好的登山型態是？",
      options: ['單日往返，輕便為主', '兩天一夜，體驗山屋/露營', '多日縱走，挑戰極限', '只要風景美都可以']
    }
  ];

  /**
   * 處理診斷工具「下一步」點擊
   */
  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else setShowResult(true);
  };

  /**
   * 根據回答計算等級與建議
   */
  const getDiagnosticResult = () => {
    let score = 0;
    Object.values(answers).forEach(val => {
      const s = val as string;
      if (s.includes('豐富') || s.includes('兩天一夜') || s.includes('重裝') || s.includes('GPX') || s.includes('多日')) score += 3;
      else if (s.includes('偶爾') || s.includes('中級山') || s.includes('一般') || s.includes('聽過')) score += 2;
      else score += 1;
    });

    if (score >= 12) {
      return {
        level: "專業探險家 (Advanced)",
        title: "您已具備挑戰高難度縱走的實力！",
        desc: "您的經驗與體能非常出色，且具備關鍵的導航與負重能力。建議可以開始規劃多日縱走或技術性攀登。",
        mountains: [
          { name: "中央尖山", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400", level: "專家級" },
          { name: "大霸尖山", img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400", level: "挑戰級" }
        ]
      };
    } else if (score >= 8) {
      return {
        level: "進階挑戰者 (Intermediate)",
        title: "您正處於邁向百岳高手的階段！",
        desc: "您已有一定的登山基礎，建議加強負重訓練與離線地圖判讀，並嘗試更多兩天一夜的入門百岳。",
        mountains: [
          { name: "雪山主峰", img: "https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=400", level: "入門級" },
          { name: "嘉明湖", img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=400", level: "挑戰級" }
        ]
      };
    } else {
      return {
        level: "入門山友 (Beginner)",
        title: "歡迎來到登山的世界！",
        desc: "目前建議從親山步道與單日往返的郊山開始，累積體力與裝備知識，安全第一是登山最重要的功課。",
        mountains: [
          { name: "合歡北峰", img: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400", level: "休閒級" },
          { name: "玉山主峰", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400", level: "入門級" }
        ]
      };
    }
  };

  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDays, setSelectedDays] = useState('1 天');
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [checklist, setChecklist] = useState<{ category: string, items: string[] }[] | null>(null);

  /**
   * 處理產生清單點擊
   */
  const handleGenerateChecklist = () => {
    if (!selectedRoute || selectedRoute === '請選擇欲前往的路線') {
      alert('請先選擇路線');
      return;
    }
    
    setIsGeneratingChecklist(true);
    
    // 模擬產生過程
    setTimeout(() => {
      const baseItems = [
        { category: '必備證件與金流', items: ['身分證正本', '入山/入園許可證', '健保卡', '少量現金與悠遊卡'] },
        { category: '核心裝備', items: ['登山包 (含防水罩)', '登山鞋', '排汗衣物', '保暖外套', '雨衣雨褲'] },
        { category: '導航與照明', items: ['離線地圖 (GPX)', '行動電源與傳輸線', '頭燈 (含備用電池)'] },
        { category: '個人藥品與衛生', items: ['個人常備藥', '簡易急救包', '衛生紙/濕紙巾', '垃圾袋 (無痕山林)'] }
      ];

      if (selectedDays !== '1 天') {
        baseItems.push({ category: '過夜裝備', items: ['睡袋', '睡墊', '換洗衣物', '盥洗用品'] });
        baseItems.push({ category: '炊事與飲水', items: ['個人餐具', '攻頂爐/瓦斯', '足量飲用水 (建議 2L+)', '行動糧/正餐'] });
      } else {
        baseItems.push({ category: '飲水與行動糧', items: ['飲用水 (1.5L)', '行動糧 (高熱量)', '午餐 (飯糰/麵包)'] });
      }

      setChecklist(baseItems);
      setIsGeneratingChecklist(false);
    }, 1200);
  };

  const result = getDiagnosticResult();
  
  // 計算總分用於雷達圖顯示
  let score = 0;
  Object.values(answers).forEach(val => {
    const s = val as string;
    if (s.includes('豐富') || s.includes('兩天一夜') || s.includes('重裝') || s.includes('GPX') || s.includes('多日')) score += 3;
    else if (s.includes('偶爾') || s.includes('中級山') || s.includes('一般') || s.includes('聽過')) score += 2;
    else score += 1;
  });

  /**
   * 處理診斷工具「上一步」點擊
   */
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  /**
   * 控制社群分享輪播的左右捲動
   */
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const currentQ = questions[step - 1];

  // 預設的路線與區域選項
  const routes = ['玉山主峰', '雪山主峰', '合歡北峰', '大霸尖山', '嘉明湖', '北大武山'];
  const regions = ['北部山區', '中部山區', '南部山區', '東部山區'];

  return (
    <div className="flex flex-col">
      {/* 英雄區 (Hero Section)：頁面標題與背景圖 */}
      <section className="h-[42vh] relative flex items-center justify-center overflow-hidden bg-black">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-65 brightness-90" 
          alt="Learning Hero" 
        />
        <div className="relative z-10 text-white text-center">
          <h1 className="text-5xl md:text-6xl font-serif tracking-[0.2em] mb-2">登山學堂</h1>
          <p className="tracking-[0.1em] text-sm opacity-80 uppercase">Mountain Academy & Community</p>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-6 md:px-10 w-full">
        {/* 知識分類區 (Academy Section)：引導至不同難度的學習內容 */}
        <section className="py-24 border-b border-border">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl mb-4">學習登山知識 · 從入門至進階</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/explore" className="h-[420px] rounded-[20px] overflow-hidden relative cursor-pointer group block">
              <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800" className="w-full h-full object-cover brightness-[0.7] group-hover:scale-110 group-hover:brightness-[0.85] transition-all duration-1000" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="text-[2.2rem] tracking-widest font-serif mb-2">入門</h3>
                <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 tracking-widest">BEGINNER GUIDE</p>
              </div>
            </Link>
            <Link to="/explore" className="h-[420px] rounded-[20px] overflow-hidden relative cursor-pointer group block">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800" className="w-full h-full object-cover brightness-[0.7] group-hover:scale-110 group-hover:brightness-[0.85] transition-all duration-1000" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="text-[2.2rem] tracking-widest font-serif mb-2">進階</h3>
                <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 tracking-widest">ADVANCED SKILLS</p>
              </div>
            </Link>
          </div>
        </section>

        {/* 登山診斷工具區 (Diagnostic Section)：互動式問答測驗 */}
        <section className="py-32 bg-white text-center -mx-6 md:-mx-10 px-6 md:px-10">
          <h2 className="font-serif text-[2.2rem] mb-2">想知道適合爬什麼山？</h2>
          <p className="text-accent font-bold mb-16">用下方診斷工具測出你的等級並直接產生專屬清單</p>
          
          <div className="max-w-[900px] mx-auto bg-[#FBFBFA] p-10 md:p-20 rounded-[24px] border border-border shadow-elegant relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div 
                  key="quiz"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="font-serif text-3xl mb-8">登山診斷小工具</h2>
                  {/* 進度條 */}
                  <div className="flex justify-center gap-4 mb-12">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", step === s ? "bg-accent scale-150" : "bg-gray-300")} />
                    ))}
                  </div>
                  
                  {/* 問題與選項內容 */}
                  <div className="text-left min-h-[400px]">
                    <div className="flex gap-4 items-start mb-10">
                      <span className="text-accent font-bold text-lg">●</span>
                      <h3 className="text-xl text-primary font-medium">{currentQ.q}</h3>
                    </div>
                    <div className="grid gap-4 mb-12">
                      {currentQ.options.map((opt) => (
                        <label 
                          key={opt} 
                          className={cn(
                            "p-6 border rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-4",
                            answers[step] === opt ? "border-primary bg-bg-base" : "border-border bg-white hover:border-primary hover:bg-bg-base/50"
                          )}
                        >
                          <input 
                            type="radio" 
                            name={`q${step}`} 
                            className="accent-primary w-4 h-4" 
                            checked={answers[step] === opt}
                            onChange={() => setAnswers({ ...answers, [step]: opt })}
                          />
                          <span className="text-base">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 控制按鈕 */}
                  <div className="flex justify-center gap-4 md:gap-5">
                    <button 
                      onClick={handlePrev}
                      disabled={step === 1}
                      className="flex-1 sm:flex-none px-6 md:px-16 py-4 border border-primary text-primary font-bold rounded-full tracking-widest hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      上一步
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={!answers[step]}
                      className="flex-1 sm:flex-none px-6 md:px-16 py-4 bg-primary text-white font-bold rounded-full tracking-widest hover:bg-accent transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {step === 5 ? '查看結果' : '下一步'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="inline-block px-6 py-2 bg-accent text-white text-sm font-bold tracking-widest rounded-full mb-8">
                    診斷結果：{result.level}
                  </div>
                  <h3 className="text-4xl font-serif text-primary mb-6 leading-tight">{result.title}</h3>
                  <p className="text-lg text-text-muted mb-8 max-w-[600px] mx-auto leading-relaxed">
                    {result.desc}
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 text-left">
                    {/* 診斷分析摘要 */}
                    <div className="lg:col-span-2 bg-white border border-border rounded-xl p-8 shadow-sm">
                      <h4 className="font-bold text-primary mb-6 flex items-center gap-2 text-lg">
                        <Star size={20} className="text-accent" /> 核心能力雷達分析
                      </h4>
                      <div className="space-y-6">
                        {[
                          { label: '體能耐力', score: score >= 12 ? 95 : score >= 8 ? 75 : 45, color: 'bg-accent' },
                          { label: '負重能力', score: answers[3]?.includes('重裝') ? 90 : answers[3]?.includes('一般') ? 65 : 30, color: 'bg-primary' },
                          { label: '導航判讀', score: answers[4]?.includes('GPX') ? 85 : 40, color: 'bg-secondary' },
                          { label: '風險管理', score: score >= 10 ? 80 : 50, color: 'bg-accent' }
                        ].map(skill => (
                          <div key={skill.label}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium">{skill.label}</span>
                              <span className="text-text-muted">{skill.score}%</span>
                            </div>
                            <div className="h-2 bg-bg-base rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.score}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={cn("h-full rounded-full", skill.color)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 建議訓練計畫 */}
                    <div className="bg-primary text-white p-8 rounded-xl shadow-sm">
                      <h4 className="font-bold mb-6 flex items-center gap-2 text-lg">
                        <Info size={20} className="text-accent" /> 建議訓練方向
                      </h4>
                      <ul className="space-y-4 text-sm opacity-90">
                        <li className="flex gap-3">
                          <CheckCircle2 size={18} className="text-accent flex-none" />
                          <span>{score >= 12 ? '維持每週兩次 10km 跑步與核心訓練' : '開始每週一次 5km 慢跑，建立基礎心肺'}</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 size={18} className="text-accent flex-none" />
                          <span>{score >= 8 ? '嘗試背負 10kg 進行郊山負重練習' : '先從輕量化裝備開始，避免膝蓋受傷'}</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 size={18} className="text-accent flex-none" />
                          <span>{answers[4]?.includes('GPX') ? '學習判讀等高線與指北針進階技巧' : '務必下載並學會使用「登山客」或「Gaia GPS」'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <h4 className="text-primary font-bold mb-6 tracking-widest uppercase text-sm">為您推薦的啟程目標</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {result.mountains.map((mt) => (
                      <div key={mt.name} className="bg-white border border-border rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-48 overflow-hidden">
                          <img src={mt.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={mt.name} />
                        </div>
                        <div className="p-8 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[0.65rem] font-bold text-accent uppercase tracking-widest">{mt.level}</span>
                              <h4 className="text-2xl font-bold text-primary mt-1">{mt.name}</h4>
                            </div>
                            <Link to="/explore" className="text-primary hover:text-accent transition-colors">
                              <ChevronRight size={24} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/explore" className="px-8 md:px-12 py-4 bg-primary text-white font-bold rounded-full tracking-widest hover:bg-accent transition-all duration-300 whitespace-nowrap text-center">
                      前往探索路線
                    </Link>
                    <button 
                      onClick={() => { setStep(1); setAnswers({}); setShowResult(false); }}
                      className="px-8 md:px-12 py-4 border border-primary text-primary font-bold rounded-full tracking-widest hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap"
                    >
                      重新診斷
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 行前自我檢查區 (Self-Check Section)：快速產生裝備清單 */}
        <section className="py-32 bg-[#E9F1F1] -mx-6 md:-mx-10 px-6 md:px-10 text-center">
          <h2 className="font-serif text-[2.2rem] mb-2">行前自我檢查</h2>
          <p className="text-primary-light font-bold mb-16">助您萬無一失，掌握啟程所需</p>
          
          <div className="bg-white p-10 md:p-16 max-w-[1100px] mx-auto rounded-2xl shadow-elegant">
            <div className="flex flex-col lg:flex-row gap-8 items-end mb-12">
              <div className="flex-1 text-left w-full">
                <label className="block text-sm font-bold text-primary-light mb-3 uppercase">路線名稱 Route</label>
                <select 
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full p-4 border border-border bg-bg-base/50 rounded-md outline-none"
                >
                  <option>請選擇欲前往的路線</option>
                  {routes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex-1 text-left w-full">
                <label className="block text-sm font-bold text-primary-light mb-3 uppercase">區域 Region</label>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-4 border border-border bg-bg-base/50 rounded-md outline-none"
                >
                  <option>請選擇區域</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex-1 text-left w-full">
                <label className="block text-sm font-bold text-primary-light mb-3 uppercase">預計天數 Days</label>
                <select 
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  className="w-full p-4 border border-border bg-bg-base/50 rounded-md outline-none"
                >
                  <option value="1 天">1 天</option>
                  <option value="2 天">2 天</option>
                  <option value="3 天以上">3 天以上</option>
                </select>
              </div>
              <button 
                onClick={handleGenerateChecklist}
                disabled={isGeneratingChecklist}
                className="bg-primary text-white px-14 py-4 font-bold rounded-md hover:bg-accent transition-all duration-300 w-full lg:w-auto disabled:opacity-50"
              >
                {isGeneratingChecklist ? '產生中...' : '產生清單'}
              </button>
            </div>

            <AnimatePresence>
              {checklist && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-left border-t border-bg-base pt-12"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-serif text-primary">
                      {selectedRoute} - 裝備檢查清單
                    </h3>
                    <button 
                      onClick={() => window.print()}
                      className="text-sm text-accent font-bold hover:underline"
                    >
                      列印清單
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {checklist.map((cat, idx) => (
                      <div key={idx} className="space-y-4">
                        <h4 className="font-bold text-primary-light border-l-4 border-accent pl-3">
                          {cat.category}
                        </h4>
                        <ul className="space-y-2">
                          {cat.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-text-muted">
                              <input type="checkbox" className="w-4 h-4 accent-accent" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 社群分享區 (Social Section)：展示用戶登山經驗 */}
        <section className="py-36 text-center relative">
          <h2 className="font-serif text-[2.4rem] mb-2">登山經驗與社群</h2>
          <p className="text-accent font-bold">分享經驗 · 帶來成長與共好</p>
          
          <div className="relative mt-20 group">
            {/* 輪播控制按鈕 */}
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>

            {/* 輪播內容容器 */}
            <div 
              ref={carouselRef}
              className="flex gap-8 overflow-x-auto pb-10 no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { title: '第一次鳶嘴山：岩稜上的極致挑戰', desc: '碎石稜線非常考驗體力與專注度，建議新手一定要有伴同行，並穿著抓地力強的鞋款...', date: '2025/08/11', author: 'Ean', img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=500', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=28456' },
                { title: '漫步雲端：雪山主峰壯麗晨曦', desc: '在黑森林的寂靜中前行，最終迎來圈谷的壯闊與主峰的日出，那一刻靈魂得到了洗滌...', date: '2025/07/20', author: 'Lily', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=27123' },
                { title: '挑戰自我：馬崙山五星級松針步道', desc: '雖然海拔落差大，但整條步道鋪滿松針，腳感紮實，是谷關七雄中最優美的路線...', date: '2025/04/01', author: 'OMG', img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=500', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=26543' },
                { title: '嘉明湖：天使的眼淚，湛藍的夢幻', desc: '在稜線上看著雲海翻騰，最終見到那一池湛藍，所有的疲累都煙消雲散了...', date: '2025/03/15', author: 'Alex', img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=500', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=25987' },
                { title: '玉山主峰：站上台灣之巔的感動', desc: '凌晨三點出發，在碎石坡上與風搏鬥，當太陽升起的那一刻，眼前的雲海美得令人屏息...', date: '2025/02/10', author: 'Sarah', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500', url: 'https://hiking.biji.co/index.php?q=review&act=info&review_id=24321' }
              ].map((post, i) => (
                <a 
                  key={i} 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-none w-[380px] bg-white border border-border rounded-xl overflow-hidden transition-all duration-400 hover:-translate-y-3 text-left shadow-sm hover:border-accent block"
                >
                  <div className="h-[240px] overflow-hidden">
                    <img src={post.img} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-9">
                    <h4 className="text-xl font-bold mb-4 text-primary leading-tight">{post.title}</h4>
                    <p className="text-sm text-text-muted leading-relaxed h-[50px] overflow-hidden mb-6">{post.desc}</p>
                    <div className="flex items-center justify-between border-t border-bg-base pt-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary" />
                        <div>
                          <p className="font-bold text-[0.85rem]">{post.author}</p>
                          <p className="text-[0.7rem] text-text-muted">{post.date}</p>
                        </div>
                      </div>
                      <div className="flex text-accent">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <Link to="/explore" className="mt-12 inline-block px-8 md:px-14 py-4 border border-primary text-primary font-bold rounded-md hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap">
            查看更多經驗分享
          </Link>
        </section>
      </div>
    </div>
  );
}
