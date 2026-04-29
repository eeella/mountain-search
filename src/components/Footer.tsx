import { Link } from 'react-router-dom';

/**
 * 頁尾組件，包含網站地圖、聯絡資訊與版權聲明
 */
export default function Footer() {
  // 頁尾連結區塊配置
  const footerSections = [
    {
      title: '探索行程',
      links: [
        { name: '熱門路線', path: '/explore' },
        { name: '隊伍申請', path: '/explore' },
        { name: '入山證辦理', path: 'https://hike.taiwan.gov.tw/' },
      ]
    },
    {
      title: '行前準備',
      links: [
        { name: '登山保險', path: '/preparation' },
        { name: '裝備清單', path: '/preparation' },
        { name: '體能訓練', path: '/preparation' },
      ]
    },
    {
      title: '登山學堂',
      links: [
        { name: '基礎知識', path: '/learning' },
        { name: '無痕山林原則', path: '/learning' },
        { name: '社群分享', path: '/learning' },
      ]
    },
    {
      title: '會員專區',
      links: [
        { name: '會員登入', path: '/login' },
        { name: '帳號註冊', path: '/login' },
        { name: '常見問題', path: '/learning' },
      ]
    }
  ];

  return (
    <footer className="bg-primary pt-24 pb-12 px-10 text-bg-base border-t border-border">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
        {/* 左側品牌與聯絡資訊 */}
        <div className="lg:col-span-1">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-widest uppercase mb-6 block">
            登山搜一下
          </Link>
          <p className="text-[0.85rem] text-white/50 leading-[2.2]">
            台北市松山區冒險路 88 號<br />
            02-1234-5678<br />
            adventure@mtsearch.tw
          </p>
        </div>

        {/* 渲染各個連結區塊 */}
        {footerSections.map((section) => (
          <div key={section.title} className="flex flex-col">
            <h4 className="text-white border-b-2 border-white/10 pb-3 mb-6 text-[0.9rem] font-extrabold uppercase tracking-[0.15em]">
              {section.title}
            </h4>
            <ul className="space-y-3.5 text-[0.85rem] text-white/60">
              {section.links.map((link) => (
                <li key={link.name}>
                  {link.path.startsWith('http') ? (
                    <a 
                      href={link.path} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-accent transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.path} className="hover:text-accent transition-colors">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 版權聲明 */}
      <div className="text-center mt-24 text-[0.7rem] text-white/30 tracking-[0.25em] uppercase">
        © 2026 MOUNTAIN SEARCH. ALL RIGHTS RESERVED. LEAVE NO TRACE.
      </div>
    </footer>
  );
}
