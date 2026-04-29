import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * 頂部導覽列組件，包含 Logo、導覽連結與登入按鈕
 * 具備滾動變色效果與行動版選單
 */
export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // 控制行動版選單開關
  const [scrolled, setScrolled] = useState(false); // 追蹤頁面是否已滾動
  const location = useLocation(); // 獲取當前路徑

  // 監聽滾動事件，改變導覽列樣式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 導覽連結配置
  const navLinks = [
    { name: '探索申請', path: '/explore' },
    { name: '行前準備', path: '/preparation' },
    { name: '登山學堂', path: '/learning' },
  ];

  // 判斷是否在首頁，首頁導覽列初始為透明
  const isHomePage = location.pathname === '/';

  return (
    <header 
      className={cn(
        "fixed w-full top-0 z-[1000] transition-all duration-500",
        (scrolled || !isHomePage)
          ? "bg-white/90 backdrop-blur-xl border-b border-border py-3 shadow-sm" // 滾動後或非首頁的樣式
          : "bg-gradient-to-b from-black/60 to-transparent py-5" // 首頁初始樣式
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex justify-between items-center">
        {/* 行動版選單開關按鈕 */}
        <button 
          className={cn(
            "md:hidden p-2 transition-colors",
            (scrolled || !isHomePage) ? "text-primary" : "text-white"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo 區域 */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <svg className="w-11 h-11 transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="19" fill="#1B2B23"/>
            <path d="M10 30L20 12L30 30H10Z" fill="white"/>
            <path d="M16 30L23 18L30 30H16Z" fill="#E87132"/>
            <circle cx="28" cy="14" r="5" stroke="white" strokeWidth="2.5"/>
            <path d="M31.5 17.5L34 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className={cn(
            "text-xl font-extrabold tracking-widest uppercase hidden sm:block transition-colors",
            (scrolled || !isHomePage) ? "text-primary" : "text-white"
          )}>
            登山搜一下
          </span>
        </Link>

        {/* 電腦版導覽連結 */}
        <nav className="hidden md:flex gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[0.85rem] font-bold uppercase tracking-widest transition-all duration-300 relative py-1",
                (scrolled || !isHomePage)
                  ? location.pathname === link.path 
                    ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" 
                    : "text-text-muted hover:text-primary"
                  : location.pathname === link.path
                    ? "text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent"
                    : "text-white/80 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 登入按鈕 */}
        <Link 
          to="/login" 
          className={cn(
            "px-7 py-2 text-[0.8rem] font-bold uppercase rounded-sm transition-all duration-300 border",
            (scrolled || !isHomePage)
              ? "border-primary text-primary hover:bg-primary hover:text-white"
              : "border-white text-white hover:bg-white hover:text-primary"
          )}
        >
          Sign In
        </Link>
      </div>

      {/* 行動版導覽選單內容 */}
      <div className={cn(
        "md:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-lg transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <nav className="flex flex-col py-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-10 py-4 text-sm font-semibold uppercase tracking-widest",
                location.pathname === link.path ? "text-primary bg-bg-base" : "text-text-muted"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
