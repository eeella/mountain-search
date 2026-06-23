import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

/**
 * 登山計畫書頁面
 * 以 iframe 內嵌 public/hiking-plan 靜態工具，外層沿用站台既有的 Header / Footer（含選單）。
 * iframe 與本站同源，故直接讀取內容高度自動撐高，呈現單一捲動的整合頁面。
 */
export default function HikingPlan() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1400);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let ro: ResizeObserver | null = null;

    const sync = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) setHeight(doc.documentElement.scrollHeight);
      } catch {
        /* 跨來源時無法讀取，維持預設高度 */
      }
    };

    const onLoad = () => {
      sync();
      try {
        const body = iframe.contentDocument?.body;
        if (body && 'ResizeObserver' in window) {
          ro = new ResizeObserver(sync);
          ro.observe(body);
        }
      } catch {
        /* ignore */
      }
    };

    iframe.addEventListener('load', onLoad);
    // 若 iframe 已載入（快取）則立即同步一次
    if (iframe.contentDocument?.readyState === 'complete') onLoad();

    return () => {
      iframe.removeEventListener('load', onLoad);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col bg-bg-base min-h-screen">
      {/* 標題帶：讓固定式導覽列有底色可疊放，並與其他內頁風格一致 */}
      <section className="relative bg-primary text-white pt-32 pb-12 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-white/70 hover:text-accent transition-colors text-sm font-bold tracking-widest uppercase mb-5"
          >
            <ArrowLeft size={15} /> 返回探索申請
          </Link>
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-none">
              <FileText size={24} className="text-accent" />
            </span>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">登山計畫書</h1>
              <p className="text-white/60 text-sm mt-1 tracking-wide">
                線上填寫行程、隊員與緊急聯絡資訊，可直接列印或匯出 PDF，作為入山／入園申請附件。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 內嵌登山計畫書工具（與本站同源，自動撐高） */}
      <iframe
        ref={iframeRef}
        src={`${import.meta.env.BASE_URL}hiking-plan/index.html`}
        title="登山計畫書"
        className="w-full block border-0"
        style={{ height }}
      />
    </div>
  );
}
