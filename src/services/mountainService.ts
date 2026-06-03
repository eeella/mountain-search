import { GoogleGenAI } from "@google/genai";

/**
 * 山區資訊服務：對接真實 API 獲取天氣與即時狀態
 */
export class MountainService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  /**
   * 獲取即時天氣資訊 (使用 Open-Meteo API)
   */
  static async getRealtimeWeather(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();
      
      if (!data.current) throw new Error('Weather data not found');

      const current = data.current;
      
      // 將 Open-Meteo 的 weather_code 轉換為可讀狀態
      const statusMap: Record<number, string> = {
        0: '晴朗',
        1: '晴時多雲', 2: '多雲', 3: '陰天',
        45: '霧', 48: '霧',
        51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        71: '小雪', 73: '中雪', 75: '大雪',
        80: '陣雨', 81: '陣雨', 82: '陣雨',
        95: '雷陣雨',
      };

      return {
        temp: Math.round(current.temperature_2m),
        feel: Math.round(current.apparent_temperature),
        status: statusMap[current.weather_code] || '未知',
        rain: current.precipitation > 0 ? 80 : 10, // 簡化降雨機率
        wind: Math.round(current.wind_speed_10m),
        humidity: current.relative_humidity_2m,
        code: current.weather_code
      };
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return null;
    }
  }

  /**
   * 獲取即時登山狀態 (使用 Gemini AI + Google Search)
   */
  static async getHikingStatus(mountainName: string) {
    try {
      const prompt = `請查詢並提供「${mountainName}」目前的登山狀態資訊。
      包含：
      1. 是否開放 (開放中/封閉中/部分管制)
      2. 最近的一則官方公告或新聞摘要
      3. 登山建議 (例如：雪季需裝備、注意落石等)
      
      請以 JSON 格式回覆：
      {
        "status": "開放中",
        "notice": "公告內容...",
        "advice": "建議內容..."
      }`;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('Failed to fetch hiking status:', error);
      return {
        status: '資訊更新中',
        notice: '請參考國家公園官網最新公告。',
        advice: '出發前請務必確認氣象與入山證件。'
      };
    }
  }
}
