import { useState, useEffect, ReactNode, ImgHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { Shield, Briefcase, Wrench, CheckCircle2, AlertCircle, Info, Wind, Thermometer, Droplets } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('insurance'); // 當前選中的標籤頁
  const [activeSubTab, setActiveSubTab] = useState('all'); // 當前選中的子標籤頁
  const [isGenerating, setIsGenerating] = useState(false); // 是否正在產生指南
  const [showGuide, setShowGuide] = useState(false); // 是否顯示產生的指南提示

  // 當主標籤切換時，重置子標籤
  useEffect(() => {
    setActiveSubTab('all');
  }, [activeTab]);

  /**
   * 處理「創建登山指南」按鈕點擊
   * 模擬分析過程並顯示結果
   */
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowGuide(true);
      // 平滑滾動至內容區域
      window.scrollTo({ top: 800, behavior: 'smooth' });
    }, 1500);
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
        {/* 指南產生表單 (Form Bar) */}
        <div className="form-bar">
          <div className="form-field">
            <label className="form-label">路線選擇 Route</label>
            <select className="form-select">
              <option>請選擇欲前往的路線</option>
              <option>玉山主峰</option>
              <option>雪山主峰</option>
              <option>大霸尖山</option>
              <option>南湖大山</option>
              <option>嘉明湖</option>
              <option>北大武山</option>
              <option>合歡北峰</option>
              <option>奇萊主北</option>
              <option>武陵四秀</option>
              <option>聖稜線</option>
              <option>奇萊南華</option>
              <option>加里山</option>
              <option>瓦拉米步道</option>
              <option>阿朗壹古道</option>
              <option>無耳茶壺山</option>
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

        {/* 指南產生成功提示 */}
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-accent/10 border border-accent/20 p-8 rounded-xl mb-16 text-center"
          >
            <h3 className="text-2xl font-serif text-accent mb-2">您的專屬指南已產生！</h3>
            <p className="text-primary/70">已根據您的路線與天數，為您篩選最合適的保險與裝備建議。</p>
          </motion.div>
        )}

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
                        img="https://images.unsplash.com/photo-1501503060445-54466a245d80?q=80&w=800"
                        icon={<Shield className="w-12 h-12 text-primary" />}
                        badge="官方推薦方案"
                        title="國泰產險 登山基本型"
                        price="642"
                        desc={["意外身故及失能保險 200 萬", "登山突發疾病住院日額 20 萬", "緊急救援費用 50 萬"]}
                        link="https://www.cathay-ins.com.tw/insurance/product/mountain/"
                      />
                      <InsuranceCard 
                        img="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800"
                        icon={<Shield className="w-12 h-12 text-accent" />}
                        badge="熱門選擇"
                        title="富邦產險 登山綜合險"
                        price="448"
                        desc={["意外死亡及失能保險 200 萬", "緊急救援補償費用 50 萬", "醫療費用實支實付 20 萬"]}
                        link="https://www.fubon.com/insurance/home/mountain/"
                      />
                      <InsuranceCard 
                        img="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800"
                        icon={<Shield className="w-12 h-12 text-secondary" />}
                        badge="高 CP 值"
                        title="明台產險 登山險"
                        price="380"
                        desc={["意外身故及失能 100 萬", "搜救費用 30 萬", "第三人責任險 50 萬"]}
                        link="https://www.msig-mingtai.com.tw/Mobile/Insurance/Mountain"
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
                        img="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800"
                        tag="#必備裝備"
                        title="專業登山鞋"
                        desc="提供良好的抓地力與足踝支撐。建議選擇中高筒防水款式（如 GORE-TEX），應對碎石與泥濘地形。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800"
                        tag="#第一層防線"
                        title="機能排汗衣"
                        desc="登山服飾的核心。快速帶走汗水避免失溫。切記「吸汗不乾」的棉質衣物是寒冷致命的殺手。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800"
                        tag="#負重核心"
                        title="人體工學登山背包"
                        desc="具備完善的負重轉移系統，將重量由肩膀轉移至髖部，節省體力並保護脊椎。建議 40L 以上。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800"
                        tag="#保暖層"
                        title="輕量羽絨外套"
                        desc="高海拔氣溫驟降，靜止時需立即穿上保暖。選擇高蓬鬆度（800FP+）且可收納至極小的款式。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1515847049296-a281d6401047?q=80&w=800"
                        tag="#防雨層"
                        title="硬殼防水外套"
                        desc="山區雨勢難測，防水透氣外套是生命線。除了擋雨，還能有效阻隔寒風侵襲。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1520223297779-95bbd1ea79b7?q=80&w=800"
                        tag="#輔助工具"
                        title="輕量登山杖"
                        desc="減輕膝蓋負擔，增加行進間的穩定性。建議使用一對，並學會正確的調整與使用技巧。"
                        link="/learning"
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
                          {[
                            {
                              category: '基本裝備 Essential',
                              items: ['登山背包 (含背包套)', '登山鞋 (建議中高筒)', '排汗襪', '登山杖']
                            },
                            {
                              category: '衣物穿戴 Clothing',
                              items: ['排汗衣 (底層)', '保暖衣 (中層)', '防水防風外套 (外層)', '登山褲', '毛帽/遮陽帽', '手套']
                            },
                            {
                              category: '導航與照明 Navigation',
                              items: ['頭燈 (含備用電池)', '離線地圖 (手機下載)', '行動電源', '指北針/紙本地圖']
                            },
                            {
                              category: '安全與急救 Safety',
                              items: ['個人藥品', '急救包', '求生毯', '哨子', '打火機']
                            },
                            {
                              category: '飲食與其他 Food & Misc',
                              items: ['足夠飲水 (建議 2L+)', '行動糧/午餐', '個人餐具', '垃圾袋', '入山入園證 (紙本)']
                            }
                          ].map((cat, idx) => (
                            <div key={idx} className="space-y-4">
                              <h4 className="font-bold text-primary border-l-4 border-accent pl-3 py-1 bg-bg-base/50">{cat.category}</h4>
                              <div className="space-y-3 pl-4">
                                {cat.items.map((item, i) => (
                                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded border-border text-accent focus:ring-accent transition-all cursor-pointer" />
                                    <span className="text-sm text-text-muted group-hover:text-primary transition-colors">{item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-4">
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
                <div className="flex justify-center gap-10 mb-10 border-b border-border">
                  {[
                    { id: 'all', label: '全部工具' },
                    { id: 'nav', label: '導航通訊' },
                    { id: 'tech', label: '技術裝備' }
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
                        img="https://images.unsplash.com/photo-1626128665085-483747621778?q=80&w=800"
                        tag="#技術工具"
                        title="專業冰爪"
                        desc="冬季雪季登山必備，提供在冰雪硬面上的抓地力。需配合硬底登山鞋使用。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=800"
                        tag="#緊急應變"
                        title="鋁箔求生毯"
                        desc="重量極輕但能反射體熱，是發生迫降或受傷時的救命裝備，請務必隨身攜帶。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800"
                        tag="#導航必備"
                        title="指北針與地圖"
                        desc="電子設備可能沒電，傳統導航工具是最後的保障。學會判讀等高線是登山者的基本功。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=800"
                        tag="#照明設備"
                        title="高亮度頭燈"
                        desc="山區入夜極快，頭燈能空出雙手確保安全。請務必攜帶備用電池並確認亮度。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800"
                        tag="#炊事設備"
                        title="輕量化攻頂爐"
                        desc="在寒冷的山頂喝上一口熱水是極大的享受。選擇穩定性高且防風效果佳的款式。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1530633762170-371692b37896?q=80&w=800"
                        tag="#通訊設備"
                        title="衛星通訊器"
                        desc="在無手機訊號區的最後防線。可發送 SOS 訊號並讓家人追蹤您的即時位置。"
                        link="/learning"
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
                        img="https://images.unsplash.com/photo-1530633762170-371692b37896?q=80&w=800"
                        tag="#導航工具"
                        title="Garmin InReach 衛星通訊"
                        desc="在無手機訊號區的最後防線。可發送 SOS 訊號並讓家人追蹤您的即時位置。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1548345680-f5475ee50858?q=80&w=800"
                        tag="#離線地圖"
                        title="Hikingbook / Gaia GPS"
                        desc="手機離線地圖是現代登山標配。務必預先下載地圖並學會判讀 GPX 軌跡。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1590012314607-cda9d9b6a919?q=80&w=800"
                        tag="#緊急通訊"
                        title="無線電對講機"
                        desc="隊伍間短距離通訊的最佳工具，特別是在地形複雜或隊伍拉長時確保聯繫。"
                        link="/learning"
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
                        img="https://images.unsplash.com/photo-1626128665085-483747621778?q=80&w=800"
                        tag="#雪季裝備"
                        title="12 齒專業冰爪"
                        desc="冬季雪季登山必備，提供在冰雪硬面上的抓地力。需配合硬底登山鞋使用。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800"
                        tag="#攀登工具"
                        title="輕量化冰斧"
                        desc="雪地行進間的支撐與滑落制動工具。使用前務必經過專業訓練。"
                        link="/learning"
                      />
                      <EquipmentCard 
                        img="https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=800"
                        tag="#防護裝備"
                        title="攀登安全帽"
                        desc="在易落石路段或技術攀登時保護頭部。輕量且通風的設計適合長途背負。"
                        link="/learning"
                      />
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
