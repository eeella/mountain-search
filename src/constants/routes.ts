/**
 * 登山路線共享資料庫
 */
export interface RouteData {
  id: string;
  title: string;
  region: string;
  level: string;
  count: number;
  img: string;
  desc: string;
  url: string;
  elevation?: string;
  distance?: string;
  duration?: string;
  itinerary?: string[];
  bestSeason?: string;
  lat?: number;
  lng?: number;
}

export const routesData: RouteData[] = [
  { 
    id: '01', 
    title: '中央尖山', 
    region: '中部山區', 
    level: '專家級', 
    count: 177, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '三尖之首，碎石坡與岩壁的終極考驗。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=054',
    elevation: '3,705m',
    distance: '約 28km',
    duration: '4 天',
    bestSeason: '5月 - 11月',
    lat: 24.3100,
    lng: 121.4172,
    itinerary: [
      'Day 1: 勝光登山口 → 710林道 → 多加屯山 → 木杆鞍部 → 南湖溪山屋 (宿)',
      'Day 2: 南湖溪山屋 → 越嶺點 → 香菇寮 → 中央尖溪山屋 (宿)',
      'Day 3: 中央尖溪山屋 → 溯溪起點 → 中央尖山東鞍 → 中央尖山主峰 → 返回中央尖溪山屋 (宿)',
      'Day 4: 中央尖溪山屋 → 木杆鞍部 → 多加屯山 → 勝光登山口 (賦歸)'
    ]
  },
  { 
    id: '02', 
    title: '玉山主峰', 
    region: '中部山區', 
    level: '入門級', 
    count: 2450, 
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', 
    desc: '東北亞最高峰，台灣人的必登之巔。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=066',
    elevation: '3,952m',
    distance: '單程 10.9km',
    duration: '2 天',
    bestSeason: '四季皆宜 (冬季需雪攀裝備)',
    lat: 23.4708,
    lng: 120.9573,
    itinerary: [
      'Day 1: 塔塔加登山口 → 孟祿亭 → 前峰登山口 → 西峰下觀景台 → 排雲山屋 (宿)',
      'Day 2: 排雲山屋 → 碎石坡 → 玉山主峰 (看日出) → 返回排雲山屋 → 塔塔加登山口 (賦歸)'
    ]
  },
  { 
    id: '03', 
    title: '雪山主峰', 
    region: '中部山區', 
    level: '入門級', 
    count: 1520, 
    img: 'https://images.unsplash.com/photo-1533675116905-f068718f39d9?q=80&w=1200', 
    desc: '圈谷景觀壯闊，冬季雪景迷人。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=051',
    elevation: '3,886m',
    distance: '單程 10.9km',
    duration: '2 天',
    bestSeason: '四季皆宜 (冬季雪景最美)',
    lat: 24.3853,
    lng: 121.2319,
    itinerary: [
      'Day 1: 雪山登山口 → 七卡山屋 → 哭坡 → 雪山東峰 → 三六九山屋 (宿)',
      'Day 2: 三六九山屋 → 黑森林 → 雪山圈谷 → 雪山主峰 → 返回登山口 (賦歸)'
    ]
  },
  { 
    id: '04', 
    title: '合歡北峰', 
    region: '中部山區', 
    level: '休閒級', 
    count: 1890, 
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200', 
    desc: '最親民的百岳，四季皆有不同美景。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=057',
    elevation: '3,422m',
    distance: '單程 2km',
    duration: '3-4 小時',
    bestSeason: '5月 (紅毛杜鵑)',
    lat: 24.1814,
    lng: 121.2811,
    itinerary: [
      '08:00 合歡北峰登山口出發',
      '09:30 抵達 1.3K 反射板 (拍照熱點)',
      '10:30 抵達合歡北峰頂 (3,422m)',
      '11:30 開始下撤',
      '12:30 返回登山口'
    ]
  },
  { 
    id: '05', 
    title: '大霸尖山', 
    region: '北部山區', 
    level: '挑戰級', 
    count: 710, 
    img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200', 
    desc: '世紀奇峰，桶狀山形極具辨識度。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=030',
    elevation: '3,492m',
    distance: '約 31km (含大鹿林道)',
    duration: '3 天',
    bestSeason: '四季皆宜',
    lat: 24.4619,
    lng: 121.2567,
    itinerary: [
      'Day 1: 觀霧服務站 → 大鹿林道東支線 (19km 步行) → 馬達拉溪登山口 → 九九山莊 (宿)',
      'Day 2: 九九山莊 → 3050高地 → 中霸坪 → 大霸尖山霸基 → 小霸尖山 → 返回九九山莊 (宿)',
      'Day 3: 九九山莊 → 馬達拉溪登山口 → 大鹿林道東支線 → 觀霧 (賦歸)'
    ]
  },
  { 
    id: '06', 
    title: '塔曼山', 
    region: '北部山區', 
    level: '入門級', 
    count: 420, 
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200', 
    desc: '魔幻森林，滿地松針與原始林相。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=181',
    elevation: '2,130m',
    distance: '單程 2.8km',
    duration: '4-5 小時',
    bestSeason: '四季皆宜',
    itinerary: [
      '09:00 塔曼山登山口 (大水塔) 出發',
      '10:30 抵達 1.5K 處 (原始林相最美區)',
      '11:30 抵達塔曼山頂 (新北第一高峰)',
      '12:30 森林午餐',
      '13:30 開始下山',
      '15:00 返回登山口'
    ]
  },
  { 
    id: '07', 
    title: '嘉明湖', 
    region: '東部山區', 
    level: '挑戰級', 
    count: 850, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '天使的眼淚，湛藍的高山隕石湖。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=145',
    elevation: '3,310m',
    distance: '單程 13km',
    duration: '3 天',
    bestSeason: '4月 - 10月',
    itinerary: [
      'Day 1: 向陽國家森林遊樂區 → 向陽山屋 (宿)',
      'Day 2: 向陽山屋 → 好漢坡 → 向陽山叉路 → 嘉明湖避難山屋 → 嘉明湖 (看藍寶石) → 返回避難山屋 (宿)',
      'Day 3: 嘉明湖避難山屋 → 向陽山 (看雲海) → 向陽山屋 → 向陽登山口 (賦歸)'
    ]
  },
  { 
    id: '08', 
    title: '北大武山', 
    region: '南部山區', 
    level: '挑戰級', 
    count: 620, 
    img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200', 
    desc: '南台灣屏障，壯闊的雲海與鐵杉林。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=119',
    elevation: '3,092m',
    distance: '單程 9km',
    duration: '2 天',
    bestSeason: '10月 - 4月 (雲海季)',
    itinerary: [
      'Day 1: 新登山口 → 舊登山口 → 喜多麗斷崖 (看雲海日落) → 檜谷山莊 (宿)',
      'Day 2: 檜谷山莊 → 大鐵杉 → 稜線 → 北大武山頂 → 返回檜谷山莊 → 新登山口 (賦歸)'
    ]
  },
  { 
    id: '09', 
    title: '南湖大山', 
    region: '中部山區', 
    level: '專家級', 
    count: 540, 
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', 
    desc: '帝王之山，壯闊的圈谷與冰河遺跡。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=053',
    elevation: '3,742m',
    distance: '約 21km',
    duration: '4 天',
    bestSeason: '5月 (杜鵑), 1月 (雪景)',
    itinerary: [
      'Day 1: 勝光登山口 → 6.8K 登山口 → 松風嶺 → 雲稜山莊 (宿)',
      'Day 2: 雲稜山莊 → 審馬陣山 → 南湖北山 → 五岩峰 → 南湖山屋 (宿)',
      'Day 3: 南湖山屋 → 南湖大山主峰 → 東峰 → 返回南湖山屋 (宿)',
      'Day 4: 南湖山屋 → 五岩峰 → 雲稜山莊 → 勝光登山口 (賦歸)'
    ]
  },
  { 
    id: '10', 
    title: '奇萊主北', 
    region: '中部山區', 
    level: '專家級', 
    count: 480, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '黑色奇萊，險峻的斷崖與壯麗的稜線。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=058',
    elevation: '3,607m',
    distance: '約 15km',
    duration: '3 天',
    bestSeason: '5月 - 11月',
    itinerary: [
      'Day 1: 合歡山滑雪山莊登山口 → 小奇萊 → 黑水塘山屋 → 成功山屋 (宿)',
      'Day 2: 成功山屋 → 奇萊主北叉路 → 奇萊北峰 → 奇萊主峰 → 返回成功山屋 (宿)',
      'Day 3: 成功山屋 → 黑水塘山屋 → 小奇萊 → 登山口 (賦歸)'
    ]
  },
  { 
    id: '11', 
    title: '武陵四秀', 
    region: '北部山區', 
    level: '挑戰級', 
    count: 350, 
    img: 'https://images.unsplash.com/photo-1533675116905-f068718f39d9?q=80&w=1200', 
    desc: '品田山、池有山、桃山、喀拉業山，四座高峰一次滿足。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=052',
    elevation: '3,524m',
    distance: '約 20km',
    duration: '3 天',
    bestSeason: '四季皆宜',
    itinerary: [
      'Day 1: 武陵農場 → 桃山瀑布步道 → 桃山登山口 → 桃山山屋 (宿)',
      'Day 2: 桃山山屋 → 桃山 → 喀拉業山 → 桃山 → 三叉路口 → 新達山屋 (宿)',
      'Day 3: 新達山屋 → 品田山 → 池有山 → 武陵農場 (賦歸)'
    ]
  },
  { 
    id: '12', 
    title: '聖稜線 (O型)', 
    region: '中部山區', 
    level: '專家級', 
    count: 85, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '台灣最壯麗的稜線，雪山至大霸尖山的朝聖之路。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=200',
    elevation: '3,886m',
    distance: '約 45km',
    duration: '6 天',
    bestSeason: '6月 - 10月',
    itinerary: [
      'Day 1: 武陵農場 → 桃山山屋',
      'Day 2: 桃山山屋 → 霸南山屋',
      'Day 3: 霸南山屋 → 大霸尖山 → 素密達山屋',
      'Day 4: 素密達山屋 → 雪山北峰 → 翠池山屋',
      'Day 5: 翠池山屋 → 雪山主峰 → 三六九山屋',
      'Day 6: 三六九山屋 → 登山口 (賦歸)'
    ]
  },
  { 
    id: '13', 
    title: '奇萊南華', 
    region: '中部山區', 
    level: '入門級', 
    count: 1200, 
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200', 
    desc: '黃金大草原與壯麗日出，最受歡迎的入門百岳縱走。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=191',
    elevation: '3,358m',
    distance: '約 26km',
    duration: '2 天',
    bestSeason: '四季皆宜',
    itinerary: [
      'Day 1: 屯原登山口 → 雲海保線所 → 天池山莊 (宿)',
      'Day 2: 天池山莊 → 奇萊南峰 (看日出) → 南華山 → 天池山莊 → 屯原登山口 (賦歸)'
    ]
  },
  { 
    id: '14', 
    title: '加里山', 
    region: '北部山區', 
    level: '挑戰級', 
    count: 980, 
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200', 
    desc: '台灣富士山，擁有迷人的柳杉林與最後的攀岩挑戰。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=18',
    elevation: '2,220m',
    distance: '約 6.4km',
    duration: '6-7 小時',
    bestSeason: '3月 - 5月 (一葉蘭)',
    itinerary: [
      '08:00 鹿場登山口出發',
      '09:30 抵達風美溪 (休息)',
      '11:00 抵達避難山屋',
      '12:30 抵達加里山頂 (一等三角點)',
      '14:00 開始下山',
      '16:00 返回登山口'
    ]
  },
  { 
    id: '15', 
    title: '瓦拉米步道', 
    region: '東部山區', 
    level: '休閒級', 
    count: 550, 
    img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200', 
    desc: '八通關古道東段，充滿歷史氣息與豐富生態的蕨類天堂。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=141',
    elevation: '1,060m',
    distance: '單程 13.6km',
    duration: '1-2 天',
    bestSeason: '四季皆宜',
    itinerary: [
      'Day 1: 山風登山口 → 山風瀑布 → 佳心 (免申請終點) → 黃麻 → 瓦拉米山屋 (宿)',
      'Day 2: 瓦拉米山屋 → 原路返回 → 山風登山口 (賦歸)'
    ]
  },
  { 
    id: '16', 
    title: '阿朗壹古道', 
    region: '南部山區', 
    level: '休閒級', 
    count: 890, 
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', 
    desc: '台灣最後的原始海岸線，壯闊的太平洋海景與南田石。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=255',
    elevation: '200m',
    distance: '約 8km',
    duration: '4-5 小時',
    bestSeason: '10月 - 4月',
    itinerary: [
      '09:00 旭海端出發',
      '10:30 抵達觀音鼻高點 (絕美海景)',
      '12:00 海岸線步行 (南田石灘)',
      '14:00 抵達下飯田端'
    ]
  },
  { 
    id: '17', 
    title: '無耳茶壺山', 
    region: '北部山區', 
    level: '休閒級', 
    count: 1250, 
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200', 
    desc: '金瓜石地標，俯瞰陰陽海與東北角海岸線。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=18',
    elevation: '580m',
    distance: '單程 1.5km',
    duration: '2 小時',
    bestSeason: '11月 (芒草季)',
    itinerary: [
      '14:00 勸濟堂停車場出發',
      '14:30 抵達朝寶亭 (休息看海)',
      '15:00 抵達茶壺山頂 (鑽入茶壺洞)',
      '16:00 原路返回看夕陽'
    ]
  },
  { 
    id: '18', 
    title: '鳶嘴山', 
    region: '中部山區', 
    level: '挑戰級', 
    count: 1100, 
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', 
    desc: '中部最著名的險峻名山，驚險的岩稜攀爬。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=19',
    elevation: '2,180m',
    distance: '約 2.1km',
    duration: '4-5 小時',
    bestSeason: '四季皆宜 (避開雨天)',
    itinerary: [
      '09:00 大雪山林道 27K 登山口出發',
      '10:30 抵達涼亭 (準備進入岩稜區)',
      '11:30 登頂鳶嘴山 (360度展望)',
      '12:30 驚險下切岩壁',
      '14:00 返回林道 27.3K 出口'
    ]
  },
  { 
    id: '19', 
    title: '郡大山', 
    region: '中部山區', 
    level: '入門級', 
    count: 880, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '坐車比爬山累的百岳，視野極佳的望鄉山脈。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=184',
    elevation: '3,265m',
    distance: '單程 3.7km',
    duration: '5-6 小時',
    bestSeason: '四季皆宜',
    itinerary: [
      '08:00 郡大林道 32K 登山口出發',
      '08:30 抵達望鄉山 (3,007m)',
      '10:30 抵達郡大山北峰',
      '11:30 登頂郡大山 (視野極佳)',
      '14:30 返回登山口'
    ]
  },
  { 
    id: '20', 
    title: '浸水營古道', 
    region: '南部山區', 
    level: '休閒級', 
    count: 450, 
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200', 
    desc: '橫跨中央山脈的歷史古道，豐富的植被與人文遺跡。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=121',
    elevation: '1,450m',
    distance: '約 15.4km',
    duration: '6-8 小時',
    bestSeason: '10月 - 4月',
    itinerary: [
      '09:00 浸水營古道西段入口出發',
      '11:00 抵達浸水營駐在所遺址',
      '13:00 抵達出水坡 (午餐)',
      '16:00 抵達東段出口 (台東大武)'
    ]
  },
  { 
    id: '21', 
    title: '南橫三星 - 塔關山', 
    region: '南部山區', 
    level: '入門級', 
    count: 1350, 
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', 
    desc: '南橫公路旁最親近的百岳，展望極佳，可眺望關山大斷崖。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=185',
    elevation: '3,222m',
    distance: '單程 2.2km',
    duration: '3-4 小時',
    bestSeason: '四季皆宜',
    itinerary: [
      '09:00 塔關山登山口 (台20線) 出發',
      '10:30 抵達大鐵杉 (拍照點)',
      '11:30 登頂塔關山',
      '13:30 返回登山口'
    ]
  },
  { 
    id: '22', 
    title: '南橫三星 - 關山嶺山', 
    region: '南部山區', 
    level: '入門級', 
    count: 1280, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '南橫公路最高點大關山隧道旁，路程短但有攀岩樂趣。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=186',
    elevation: '3,176m',
    distance: '單程 1.5km',
    duration: '2-3 小時',
    bestSeason: '四季皆宜',
    itinerary: [
      '10:00 大關山隧道口出發',
      '11:00 抵達稜線 (風大需注意)',
      '11:30 登頂關山嶺山',
      '12:30 返回隧道口'
    ]
  },
  { 
    id: '23', 
    title: '南橫三星 - 庫哈諾辛山', 
    region: '南部山區', 
    level: '入門級', 
    count: 950, 
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200', 
    desc: '南橫三星中最具挑戰性的一座，擁有壯闊的鐵杉林。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=187',
    elevation: '3,115m',
    distance: '單程 3.5km',
    duration: '5-6 小時',
    bestSeason: '四季皆宜',
    itinerary: [
      '08:00 進涇橋登山口出發',
      '10:00 抵達庫哈諾辛山屋',
      '11:30 登頂庫哈諾辛山',
      '14:00 返回登山口'
    ]
  },
  { 
    id: '24', 
    title: '水漾森林', 
    region: '中部山區', 
    level: '挑戰級', 
    count: 820, 
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200', 
    desc: '921地震形成的堰塞湖，枯木倒影如夢似幻。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=25',
    elevation: '1,800m',
    distance: '約 11km',
    duration: '2 天',
    bestSeason: '10月 - 3月',
    itinerary: [
      'Day 1: 杉林溪仁亭登山口 → 鹿屈山 → 水漾森林 (營地宿)',
      'Day 2: 水漾森林 → 眠月線叉路 → 杉林溪 (賦歸)'
    ]
  },
  { 
    id: '25', 
    title: '松羅湖', 
    region: '北部山區', 
    level: '入門級', 
    count: 760, 
    img: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1200', 
    desc: '十七歲少女之湖，終年雲霧繚繞，景致清幽。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=188',
    elevation: '1,300m',
    distance: '單程 5.4km',
    duration: '1-2 天',
    bestSeason: '10月 - 4月 (水量較豐)',
    itinerary: [
      '09:00 大桶山登山口出發',
      '11:00 抵達水龍頭營地 (休息)',
      '13:30 抵達松羅湖 (紮營或原路返回)',
      '16:00 返回登山口'
    ]
  },
  { 
    id: '26', 
    title: '能高越嶺西段', 
    region: '中部山區', 
    level: '休閒級', 
    count: 1100, 
    img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200', 
    desc: '歷史悠久的越嶺古道，坡度平緩，風景秀麗。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=084',
    elevation: '2,860m',
    distance: '單程 13km',
    duration: '2 天',
    bestSeason: '四季皆宜',
    itinerary: [
      'Day 1: 屯原登山口 → 雲海保線所 → 天池山莊 (宿)',
      'Day 2: 天池山莊 → 原路返回屯原登山口 (賦歸)'
    ]
  },
  { 
    id: '27', 
    title: '向陽山', 
    region: '東部山區', 
    level: '入門級', 
    count: 680, 
    img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200', 
    desc: '嘉明湖途中的百岳，擁有著名的向陽大崩壁。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=189',
    elevation: '3,602m',
    distance: '單程 7.4km',
    duration: '2 天',
    bestSeason: '四季皆宜',
    itinerary: [
      'Day 1: 向陽登山口 → 向陽山屋 (宿)',
      'Day 2: 向陽山屋 → 向陽山頂 → 返回登山口 (賦歸)'
    ]
  },
  { 
    id: '28', 
    title: '三貂嶺瀑布群', 
    region: '北部山區', 
    level: '休閒級', 
    count: 1500, 
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200', 
    desc: '新北熱門步道，一次觀賞合谷、摩天、枇杷洞三座瀑布。', 
    url: 'https://hiking.biji.co/index.php?q=trail&act=detail&id=190',
    elevation: '200m',
    distance: '約 7km',
    duration: '3-4 小時',
    bestSeason: '四季皆宜',
    itinerary: [
      '09:00 三貂嶺車站出發',
      '10:00 抵達合谷瀑布',
      '11:00 抵達摩天瀑布',
      '12:00 抵達枇杷洞瀑布',
      '13:00 抵達大華車站 (賦歸)'
    ]
  },
  { 
    id: '29', 
    title: '草嶺古道', 
    region: '北部山區', 
    level: '休閒級', 
    count: 2100, 
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200', 
    desc: '清代古道，秋季芒花盛開時美不勝收。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=001',
    elevation: '500m',
    distance: '約 8.5km',
    duration: '3-4 小時',
    bestSeason: '11月 (芒花季)',
    itinerary: [
      '10:00 福隆車站出發',
      '11:30 抵達雄鎮蠻煙碑',
      '12:30 抵達埡口 (看海拍照)',
      '14:00 抵達大里天公廟'
    ]
  },
  { 
    id: '30', 
    title: '錐麓古道', 
    region: '東部山區', 
    level: '入門級', 
    count: 1800, 
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', 
    desc: '太魯閣最驚險的步道，行走在垂直的斷崖峭壁上。', 
    url: 'https://recreation.forest.gov.tw/Trail/RT?tr_id=140',
    elevation: '765m',
    distance: '單程 3.1km',
    duration: '3-4 小時',
    bestSeason: '四季皆宜 (需預約)',
    itinerary: [
      '08:00 燕子口登山口出發',
      '09:30 抵達巴達岡駐在所',
      '10:30 抵達錐麓大斷崖 (最驚險段)',
      '11:30 抵達斷崖駐在所 (折返點)',
      '13:30 返回登山口'
    ]
  },
];
