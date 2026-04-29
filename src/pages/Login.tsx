import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

/**
 * 登入頁面組件，包含帳號密碼登入與第三方社群登入
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * 處理登入提交
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 模擬 API 請求
    setTimeout(() => {
      if (email === 'test@example.com' && password === 'password') {
        // 登入成功
        setIsLoading(false);
        // 這裡可以設置全域狀態或存儲 token
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else {
        // 登入失敗
        setIsLoading(false);
        setError('帳號或密碼錯誤，請重新輸入。');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <div className="flex-1 flex items-center justify-center p-5 pt-32 pb-16">
        <div className="w-full max-w-[1000px]">
          {/* 登入卡片容器 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-border flex flex-col md:flex-row"
          >
            {/* 左側：裝飾性圖片 (僅在桌面版顯示) */}
            <div className="flex-[1.1] bg-black relative overflow-hidden hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1500" 
                alt="Login Decoration" 
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-[1500ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                <div className="text-white">
                  <h3 className="text-3xl font-serif mb-2 tracking-wider">探索未知的巔峰</h3>
                  <p className="opacity-70 text-sm tracking-widest">JOIN THE MOUNTAIN EXPLORATION</p>
                </div>
              </div>
            </div>

            {/* 右側：登入表單區域 */}
            <div className="flex-1 bg-[#FFF9F1] p-12 md:p-16 flex flex-col justify-center text-center">
              <h2 className="font-serif text-[2.2rem] text-[#5D5447] mb-10 tracking-[0.15em]">歡迎登入</h2>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-500 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* 帳號密碼表單 */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-left relative">
                  <label className="block text-[0.8rem] font-bold mb-2 text-[#5D5447]">帳號 <span className="text-red-500 ml-1">*</span></label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 border border-black/10 rounded-lg text-[0.95rem] outline-none bg-white focus:border-[#5D5447] transition-all" 
                    placeholder="請輸入電子郵件 (test@example.com)" 
                    required 
                  />
                </div>
                
                <div className="text-left relative">
                  <label className="block text-[0.8rem] font-bold mb-2 text-[#5D5447]">密碼 <span className="text-red-500 ml-1">*</span></label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3.5 border border-black/10 rounded-lg text-[0.95rem] outline-none bg-white focus:border-[#5D5447] transition-all" 
                    placeholder="請輸入密碼 (password)" 
                    required 
                  />
                </div>

                <div className="text-right -mt-2 mb-8">
                  <Link to="#" className="inline text-[0.8rem] text-[#5D5447] border-b border-[#5D5447]/30">忘記密碼？</Link>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full p-4 bg-[#5D5447] text-white font-semibold text-lg tracking-[0.3em] rounded-xl hover:bg-primary transition-all duration-300 disabled:opacity-70"
                >
                  {isLoading ? '登入中...' : '會員登入'}
                </button>
              </form>

              {/* 第三方社群登入按鈕 */}
              <div className="mt-8 flex justify-center gap-4">
                <button className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:border-primary transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-4.5 opacity-80" alt="Google" />
                </button>
                <button className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:border-primary transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" className="w-4.5 opacity-80" alt="LINE" />
                </button>
              </div>

              {/* 註冊引導 */}
              <div className="mt-10 bg-white rounded-full py-4 px-8 flex items-center justify-center gap-5 shadow-sm">
                <p className="text-[0.85rem] text-gray-400">還不是會員嗎？</p>
                <Link to="#" className="border border-gray-300 px-6 py-1.5 rounded-full text-[0.85rem] font-bold hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap">
                  手刀加入
                </Link>
              </div>
            </div>
          </motion.div>

          {/* 底部說明文字 */}
          <div className="mt-10 text-gray-400 text-[0.75rem] leading-relaxed text-left px-2">
            <h4 className="font-serif text-primary mb-2 text-[0.85rem]">會員相關問題</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>登山找一下中各項服務，如：入山申請、課程報名、裝備檢查等，均需要登入會員後方可進行。</li>
              <li>您的個人資料均依相關規定加密保存，詳見「個人資料保護聲明」。</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
