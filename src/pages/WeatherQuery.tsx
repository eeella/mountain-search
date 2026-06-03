import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { routesData } from '../constants/routes';
import { MountainService } from '../services/mountainService';

/**
 * 山區即時天氣查詢頁面：自由輸入地名/座標 + Windy 互動地圖 + Open-Meteo 即時數據
 */
export default function WeatherQuery() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [quickRouteId, setQuickRouteId] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number; name: string }>({
    lat: 23.4708, lng: 120.9573, name: '玉山主峰',
  });
  const [weather, setWeather] = useState<{
    temp: number; feel: number; status: string; rain: number; wind: number; humidity: number; code: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const initialFetchDone = useRef(false);

  const weatherableRoutes = routesData.filter(r => r.lat !== undefined && r.lng !== undefined);

  const fetchWeather = async (lat: number, lng: number) => {
    setIsLoading(true);
    setWeather(null);
    try {
      const data = await MountainService.getRealtimeWeather(lat, lng);
      if (data) {
        setWeather(data);
      } else {
        setError('天氣資料暫時無法取得');
      }
    } catch {
      setError('天氣資料暫時無法取得');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    // URL 帶有 ?q= 時，直接拿來查；否則用預設玉山主峰
    if (initialQuery) {
      // 用 setTimeout 確保 state 設定後再呼叫 handleSearch
      setTimeout(() => handleSearch(), 0);
    } else {
      fetchWeather(coords.lat, coords.lng);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateLocation = async (lat: number, lng: number, name: string) => {
    setError('');
    setCoords({ lat, lng, name });
    await fetchWeather(lat, lng);
  };

  const parseLatLng = (s: string): { lat: number; lng: number } | null => {
    // 支援 "lat,lng"、"lat lng"、windy URL 結尾的 "lat,lng,zoom"
    const m = s.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)(?:\s*[,，\s]\s*\d+(?:\.\d+)?)?\s*$/);
    if (!m) return null;
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat, lng };
  };

  // 從 routesData 找本地匹配（解決「玉山」被當成中國陝西、「玉山主峰」/「嘉明湖」查無結果的問題）
  const findLocalRoute = (input: string) => {
    const q = input.trim().toLowerCase();
    if (!q) return null;
    return weatherableRoutes.find(r => {
      const t = r.title.toLowerCase();
      return t === q || t.includes(q) || q.includes(t);
    }) || null;
  };

  // Nominatim (OpenStreetMap) — 涵蓋山岳、湖泊、古道、街道，幾乎找得到台灣任何地點
  const nominatimSearch = async (query: string, twOnly: boolean) => {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      'accept-language': 'zh-TW',
    });
    if (twOnly) params.set('countrycodes', 'tw');
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });
    const arr: any[] = await res.json();
    if (!arr || arr.length === 0) return null;
    const r = arr[0];
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      name: r.display_name as string,
    };
  };

  // Open-Meteo geocoding（國際備援；對台灣特定山岳/湖泊覆蓋度差）
  const openMeteoGeocode = async (query: string) => {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=zh&format=json`
    );
    const d = await res.json();
    const results: any[] = d.results || [];
    if (results.length === 0) return null;
    const tw = results.find(r => r.country_code === 'TW' || /台灣|臺灣|Taiwan/i.test(r.country || ''));
    const hit = tw || results[0];
    return {
      lat: hit.latitude as number,
      lng: hit.longitude as number,
      name: [hit.name, hit.admin2, hit.admin1, hit.country].filter(Boolean).join(', ') as string,
    };
  };

  const handleSearch = async () => {
    const input = searchInput.trim();
    if (!input) {
      setError('請輸入地名或座標');
      return;
    }

    setError('');

    // 1) 座標格式
    const latlng = parseLatLng(input);
    if (latlng) {
      await updateLocation(latlng.lat, latlng.lng, `${latlng.lat.toFixed(3)}, ${latlng.lng.toFixed(3)}`);
      return;
    }

    // 2) 本地路線（最快）
    const local = findLocalRoute(input);
    if (local && local.lat !== undefined && local.lng !== undefined) {
      await updateLocation(local.lat, local.lng, local.title);
      return;
    }

    setIsLoading(true);
    try {
      // 3) Nominatim，限定台灣
      let hit = await nominatimSearch(input, true);

      // 4) Nominatim 全球
      if (!hit) hit = await nominatimSearch(input, false);

      // 5) Open-Meteo 最後 fallback
      if (!hit) hit = await openMeteoGeocode(input);

      if (hit) {
        await updateLocation(hit.lat, hit.lng, hit.name);
      } else {
        setError('找不到該地點，可改用「緯度,經度」格式（例：23.47, 120.96）');
        setIsLoading(false);
      }
    } catch {
      setError('搜尋失敗，請稍後再試');
      setIsLoading(false);
    }
  };

  const handleQuickSelect = async (id: string) => {
    setQuickRouteId(id);
    if (!id) return;
    const r = weatherableRoutes.find(x => x.id === id);
    if (r && r.lat !== undefined && r.lng !== undefined) {
      setSearchInput('');
      await updateLocation(r.lat, r.lng, r.title);
    }
  };

  const getWeatherIcon = (code: number, size = 28) => {
    if (code === 0 || code === 1) return <Sun size={size} />;
    if ([2, 3, 45, 48].includes(code)) return <Cloud size={size} />;
    if (code >= 51 && code <= 99) return <CloudRain size={size} />;
    return <Cloud size={size} />;
  };

  const windySrc = `https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lng}&detailLat=${coords.lat}&detailLon=${coords.lng}&zoom=9&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  const windyExternal = `https://www.windy.com/?${coords.lat},${coords.lng},9`;

  return (
    <div className="flex flex-col bg-bg-base min-h-screen">
      {/* Hero */}
      <section className="relative h-[34vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-primary">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/NanhuMountain_02.jpg/1280px-NanhuMountain_02.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Weather Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/40" />
        <div className="relative z-10 text-center text-white px-6">
          <p className="tracking-[0.3em] text-xs font-bold uppercase opacity-80 mb-2">Real-time Mountain Weather</p>
          <h1 className="text-4xl md:text-5xl font-serif tracking-[0.1em]">山區即時天氣查詢</h1>
          <p className="text-sm opacity-80 mt-3">輸入地名或座標，即時查看 Open-Meteo 數據與 Windy 互動氣象圖</p>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 w-full -mt-12 relative z-10 pb-24">
        {/* 搜尋列 */}
        <div className="bg-white rounded-2xl shadow-xl border border-border p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_auto] gap-3">
            <div className="relative">
              <label className="block text-[0.65rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-60 mb-2">輸入地名 / 座標</label>
              <Search className="absolute left-3 top-[2.45rem] text-text-muted" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                placeholder="例：玉山主峰、合歡山、23.47, 120.96"
                className="w-full pl-10 pr-4 py-3 bg-bg-base/50 border border-border rounded-md outline-none focus:border-primary transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-[0.65rem] font-extrabold text-primary uppercase tracking-[0.2em] opacity-60 mb-2">或快速選擇預設山區</label>
              <select
                value={quickRouteId}
                onChange={(e) => handleQuickSelect(e.target.value)}
                className="w-full p-3 bg-bg-base/50 border border-border rounded-md outline-none focus:border-primary transition-all text-sm"
              >
                <option value="">－ 請選擇 －</option>
                {weatherableRoutes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}（{r.region}）</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full lg:w-auto px-8 py-3 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isLoading ? '查詢中...' : <><Search size={14} /> 查詢</>}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          {/* 位置 + 即時天氣摘要：合併在同一面板的下方 */}
          <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2 text-xs text-text-muted pr-4 border-r border-border/60">
              <MapPin size={12} className="text-accent" />
              <span>目前位置：<strong className="text-primary">{coords.name}</strong>（{coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}）</span>
            </div>

            <AnimatePresence mode="wait">
              {weather && (
                <motion.div
                  key={`${coords.lat}-${coords.lng}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-accent">{getWeatherIcon(weather.code, 22)}</div>
                    <span className="text-2xl font-bold text-primary leading-none">{weather.temp}°</span>
                    <span className="text-text-muted text-xs">體感 {weather.feel}°</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[0.65rem] tracking-widest">
                      {weather.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Droplets size={13} className="text-text-muted" />
                    <span className="text-text-muted">降雨</span>
                    <span className="font-bold text-primary">{weather.rain}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Wind size={13} className="text-text-muted" />
                    <span className="text-text-muted">風速</span>
                    <span className="font-bold text-primary">{weather.wind} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Thermometer size={13} className="text-text-muted" />
                    <span className="text-text-muted">濕度</span>
                    <span className="font-bold text-primary">{weather.humidity}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <a
              href={windyExternal}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-accent text-xs font-bold inline-flex items-center gap-1 hover:underline"
            >
              在 Windy 開啟完整版 <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Windy 互動氣象地圖（主視覺） */}
        <div className="mt-4 rounded-2xl overflow-hidden border border-border shadow-xl bg-white">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-base/40">
            <h3 className="font-serif text-lg font-bold text-primary">互動氣象地圖（Windy）</h3>
            <span className="text-[0.65rem] text-text-muted tracking-widest uppercase">Powered by Windy.com</span>
          </div>
          <iframe
            key={`${coords.lat}-${coords.lng}`}
            title="Windy weather map"
            src={windySrc}
            width="100%"
            height="820"
            className={cn('w-full block border-0', isLoading && 'opacity-70')}
            allow="geolocation"
          />
        </div>

        <p className="mt-3 text-[0.7rem] text-text-muted leading-relaxed">
          地圖上可自行拖拉、縮放、切換圖層（風速 / 降雨 / 氣溫 / 雲層 / 雪量）。上方搜尋列可輸入任何地名（中文/英文）或「緯度,經度」直接定位。
        </p>
      </div>
    </div>
  );
}
