import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mountain, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TAIWAN_100_PEAKS } from '../constants/taiwan100Peaks';

/**
 * 百岳互動地圖：Leaflet + OpenStreetMap，100 顆 marker，依山系著色
 */
export default function PeaksMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerByName = useRef<Map<string, any>>(new Map());
  const layersRef = useRef<{ '中央山脈': any[]; '雪山山脈': any[]; '玉山山脈': any[] }>({
    '中央山脈': [], '雪山山脈': [], '玉山山脈': [],
  });

  const [filter, setFilter] = useState<'all' | '中央山脈' | '雪山山脈' | '玉山山脈'>('all');
  const [ready, setReady] = useState(false);
  const [searchParams] = useSearchParams();
  const focusName = searchParams.get('focus');

  // Stats
  const counts = {
    '中央山脈': TAIWAN_100_PEAKS.filter(p => p.range === '中央山脈').length,
    '雪山山脈': TAIWAN_100_PEAKS.filter(p => p.range === '雪山山脈').length,
    '玉山山脈': TAIWAN_100_PEAKS.filter(p => p.range === '玉山山脈').length,
  };

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    // Load Leaflet CSS once
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const init = () => {
      if (cancelled || !mapRef.current) return;
      const L = (window as any).L;
      if (!L) return;
      if (mapInstance.current) return; // already initialized

      const map = L.map(mapRef.current, {
        center: [23.75, 121.0],
        zoom: 8,
        scrollWheelZoom: true,
      });
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      const colors: Record<string, string> = {
        '中央山脈': '#E87132',
        '雪山山脈': '#3B82F6',
        '玉山山脈': '#10B981',
      };

      TAIWAN_100_PEAKS.forEach(p => {
        if (p.lat === undefined || p.lng === undefined) return;
        const color = colors[p.range] || '#E87132';
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 7,
          fillColor: color,
          color: '#fff',
          weight: 1.8,
          fillOpacity: 0.9,
        }).addTo(map);
        marker.bindPopup(`
          <div style="min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Microsoft JhengHei', sans-serif">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="background: ${color}; color: white; font-size: 10px; padding: 2px 6px; border-radius: 3px; letter-spacing: 1px;">#${String(p.rank).padStart(3, '0')}</span>
              <strong style="font-size: 15px; color: #1B2B23;">${p.name}</strong>
            </div>
            <div style="color: #666; font-size: 12px; margin-bottom: 8px; line-height: 1.5;">
              海拔 <strong>${p.elevation.toLocaleString()}m</strong><br>
              山系：${p.range}
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="/weather?q=${encodeURIComponent(p.name)}" style="background: #1B2B23; color: white; font-size: 11px; font-weight: bold; padding: 5px 10px; border-radius: 4px; text-decoration: none;">即時氣象</a>
              <a href="https://hiking.biji.co/index.php?q=trail&keyword=${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer" style="border: 1px solid #1B2B23; color: #1B2B23; font-size: 11px; font-weight: bold; padding: 5px 10px; border-radius: 4px; text-decoration: none;">GPX 軌跡</a>
            </div>
          </div>
        `);
        layersRef.current[p.range].push(marker);
        markerByName.current.set(p.name, { marker, peak: p });
      });

      setReady(true);
    };

    if ((window as any).L) {
      init();
    } else {
      const jsId = 'leaflet-js';
      if (document.getElementById(jsId)) {
        // waiting for existing script
        const wait = setInterval(() => {
          if ((window as any).L) { clearInterval(wait); init(); }
        }, 100);
      } else {
        const script = document.createElement('script');
        script.id = jsId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = init;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      layersRef.current = { '中央山脈': [], '雪山山脈': [], '玉山山脈': [] };
    };
  }, []);

  // Apply range filter
  useEffect(() => {
    if (!ready || !mapInstance.current) return;
    const map = mapInstance.current;
    (Object.keys(layersRef.current) as Array<keyof typeof layersRef.current>).forEach(rng => {
      layersRef.current[rng].forEach(marker => {
        if (filter === 'all' || filter === rng) {
          if (!map.hasLayer(marker)) marker.addTo(map);
        } else {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        }
      });
    });
  }, [filter, ready]);

  // ?focus=<name>：地圖載入後飛到該百岳並開啟 popup
  useEffect(() => {
    if (!ready || !mapInstance.current || !focusName) return;
    // 嘗試完整名稱、包含關係
    let hit = markerByName.current.get(focusName);
    if (!hit) {
      for (const [name, entry] of markerByName.current.entries()) {
        if (name.includes(focusName) || focusName.includes(name)) { hit = entry; break; }
      }
    }
    if (hit) {
      const { marker, peak } = hit;
      mapInstance.current.flyTo([peak.lat, peak.lng], 12, { duration: 1.2 });
      setTimeout(() => marker.openPopup(), 800);
    }
  }, [ready, focusName]);

  const FilterChip = ({ k, label, color }: { k: typeof filter; label: string; color: string }) => (
    <button
      type="button"
      onClick={() => setFilter(k)}
      className={cn(
        "px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 border",
        filter === k ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border hover:border-primary"
      )}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col bg-bg-base min-h-screen">
      {/* Hero */}
      <section className="relative h-[30vh] min-h-[220px] flex items-center justify-center overflow-hidden bg-primary">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Yushan_main_east_peak%2BHuang_Chung_Yu%E9%BB%83%E4%B8%AD%E4%BD%91%2B9030.png/1280px-Yushan_main_east_peak%2BHuang_Chung_Yu%E9%BB%83%E4%B8%AD%E4%BD%91%2B9030.png"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/40" />
        <div className="relative z-10 text-center text-white px-6">
          <p className="tracking-[0.3em] text-xs font-bold uppercase opacity-80 mb-2">Taiwan 100 Peaks · Interactive Map</p>
          <h1 className="text-4xl md:text-5xl font-serif tracking-[0.1em]">百岳互動地圖</h1>
          <p className="text-sm opacity-80 mt-3">100 座台灣百岳真實座標，依山系標色，點選查看即時氣象與軌跡</p>
        </div>
      </section>

      <div className="max-w-[1320px] mx-auto px-6 md:px-10 w-full py-10">
        {/* Filter + Stats */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all border",
                filter === 'all' ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border hover:border-primary"
              )}
            >
              全部（100）
            </button>
            <FilterChip k="中央山脈" label={`中央山脈（${counts['中央山脈']}）`} color="#E87132" />
            <FilterChip k="雪山山脈" label={`雪山山脈（${counts['雪山山脈']}）`} color="#3B82F6" />
            <FilterChip k="玉山山脈" label={`玉山山脈（${counts['玉山山脈']}）`} color="#10B981" />
          </div>
          <Link
            to="/weather"
            className="inline-flex items-center gap-2 text-sm text-accent font-bold hover:underline"
          >
            前往天氣查詢 <ArrowRight size={14} />
          </Link>
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          className="rounded-2xl shadow-xl border border-border bg-white"
          style={{ height: '680px', width: '100%' }}
        />
        {!ready && (
          <div className="mt-4 text-center text-xs text-text-muted">地圖載入中...</div>
        )}

        {/* Side legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['中央山脈', '雪山山脈', '玉山山脈'] as const).map(rng => {
            const colors: Record<string, string> = { '中央山脈': '#E87132', '雪山山脈': '#3B82F6', '玉山山脈': '#10B981' };
            const sample = TAIWAN_100_PEAKS.filter(p => p.range === rng).slice(0, 3);
            return (
              <div key={rng} className="bg-white p-5 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ background: colors[rng] }} />
                  <h4 className="font-bold text-primary">{rng}</h4>
                  <span className="text-xs text-text-muted ml-auto">{counts[rng]} 座</span>
                </div>
                <div className="space-y-1 text-xs text-text-muted">
                  {sample.map(p => (
                    <div key={p.rank} className="flex items-center gap-2">
                      <Mountain size={11} className="opacity-40 flex-none" />
                      <span>#{String(p.rank).padStart(3, '0')} {p.name}</span>
                      <span className="ml-auto">{p.elevation.toLocaleString()}m</span>
                    </div>
                  ))}
                  <div className="text-[0.65rem] tracking-widest uppercase pt-1 opacity-40">...等 {counts[rng]} 座</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
