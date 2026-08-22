export const cardCategories = {
  代词: [
    "我",
    "你",
    "这封回复",
    "此刻",
    "远处的声音",
    "未读的念头",
    "一段停留",
    "今天的空气"
  ],

  动作: [
    "正在靠近",
    "仍然记得",
    "想停留一会",
    "没有离开",
    "会慢慢回答",
    "正在整理",
    "刚好路过",
    "愿意听见"
  ],

  时间: [
    "在此刻",
    "在很安静的时候",
    "在下一次天亮之前",
    "在风停下以后",
    "在这段等待里",
    "在没有说出口的地方",
    "在今天",
    "在你看见它的时候"
  ],

  物品: [
    "一张折起的纸",
    "一杯还温热的饮料",
    "一枚旧钥匙",
    "一段没有寄出的录音",
    "一盏微弱的灯",
    "一片被保留的叶子",
    "一张空白车票",
    "一本翻到中间的书"
  ]
};

export const fallbackCards = [
  "信号暂未抵达，但问题已被保留。",
  "这一次没有收到完整回应。",
  "回音已存档，等待下一次发送。",
  "线路仍在开启，答案稍后会抵达。",
  "暂时没有新的内容，请保留这条问题。"
];

export const tarotCards = [
  {
    id: "the-fool",
    name: "愚人",
    englishName: "THE FOOL",
    meaning: "一条尚未命名的路，正从脚下安静展开。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M19 48L31 19l14 29"/><path d="M16 48h32"/><circle cx="31" cy="15" r="3"/><path d="M39 27l5-4M22 35l-5 2"/></svg>`
  },
  {
    id: "the-magician",
    name: "魔术师",
    englishName: "THE MAGICIAN",
    meaning: "桌面上的几件小物，等待被重新排列。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M15 45h34M20 45V28h24v17M26 28v-8h12v8"/><circle cx="32" cy="36" r="4"/><path d="M17 18h7M40 18h7"/></svg>`
  },
  {
    id: "the-high-priestess",
    name: "女祭司",
    englishName: "THE HIGH PRIESTESS",
    meaning: "帷幕之后没有答案，只有尚未说出的留白。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 50V14h10v36M37 50V14h10v36"/><path d="M27 18c7 4 3 16 10 20M27 18c-4 8 0 16 10 20"/><path d="M25 54h14"/><path d="M30 10c2-2 5-2 7 0"/></svg>`
  },
  {
    id: "the-empress",
    name: "皇后",
    englishName: "THE EMPRESS",
    meaning: "柔软的枝叶围住中心，也留出呼吸的空隙。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="8"/><path d="M32 24V14M25 27l-8-6M39 27l8-6M24 35l-9 5M40 35l9 5M28 39l-3 10M36 39l3 10"/><path d="M20 50c7 3 17 3 24 0"/></svg>`
  },
  {
    id: "the-emperor",
    name: "皇帝",
    englishName: "THE EMPEROR",
    meaning: "石阶排列得很稳，远处仍有风穿过。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M16 48h32M20 48V38h24v10M24 38V28h16v10M28 28V18h8v10"/><path d="M18 52h28"/></svg>`
  },
  {
    id: "the-hierophant",
    name: "教皇",
    englishName: "THE HIEROPHANT",
    meaning: "翻开的书页之间，旧有的声音仍在停留。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M14 18c8-3 14 0 18 5 4-5 10-8 18-5v28c-8-3-14 0-18 5-4-5-10-8-18-5V18z"/><path d="M32 23v28M20 28h7M37 28h7M20 35h7M37 35h7"/></svg>`
  },
  {
    id: "the-lovers",
    name: "恋人",
    englishName: "THE LOVERS",
    meaning: "两条靠近的线，在中途保留各自的方向。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="24" r="7"/><circle cx="42" cy="24" r="7"/><path d="M22 31c1 10 5 15 10 20 5-5 9-10 10-20"/><path d="M29 20l3 3 3-3"/></svg>`
  },
  {
    id: "the-chariot",
    name: "战车",
    englishName: "THE CHARIOT",
    meaning: "车辙向前延伸，窗外的景色慢慢后退。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 42V25h30v17"/><path d="M22 25l4-8h12l4 8"/><path d="M24 31h16"/><circle cx="23" cy="45" r="5"/><circle cx="41" cy="45" r="5"/><path d="M13 51h38"/></svg>`
  },
  {
    id: "strength",
    name: "力量",
    englishName: "STRENGTH",
    meaning: "掌心没有用力，却让散开的线慢慢归拢。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 40c3-12 10-18 18-18 7 0 11 5 10 11-1 7-9 8-14 4"/><path d="M18 40c5 5 11 7 18 5"/><path d="M24 47l-3 6M31 47v7M38 45l4 6"/></svg>`
  },
  {
    id: "the-hermit",
    name: "隐者",
    englishName: "THE HERMIT",
    meaning: "一盏小灯照见脚边，足以陪伴这一段夜路。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 13c8 8 10 18 8 35H24c-2-17 0-27 8-35z"/><path d="M27 31h10v11H27z"/><path d="M32 17v8M18 52h28"/></svg>`
  },
  {
    id: "wheel-of-fortune",
    name: "命运之轮",
    englishName: "WHEEL OF FORTUNE",
    meaning: "轮子转过同一扇窗，光线已换了位置。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="4"/><path d="M32 14v14M50 32H36M32 50V36M14 32h14"/><path d="M20 20l5 5M44 20l-5 5M44 44l-5-5M20 44l5-5"/></svg>`
  },
  {
    id: "justice",
    name: "正义",
    englishName: "JUSTICE",
    meaning: "两只空盘轻轻悬着，等待风停下来。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 13v38M20 20h24M32 13l4 4M32 13l-4 4"/><path d="M20 20l-8 16h16l-8-16zM44 20l-8 16h16l-8-16z"/><path d="M24 51h16"/></svg>`
  },
  {
    id: "the-hanged-man",
    name: "倒悬者",
    englishName: "THE HANGED MAN",
    meaning: "视线暂时倒转，熟悉的枝头显出新轮廓。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 15h28M24 15v9M40 15v9"/><circle cx="32" cy="31" r="5"/><path d="M32 24v18M32 42l-8 9M32 42l8 9M32 29l-7 6M32 29l7 6"/></svg>`
  },
  {
    id: "death",
    name: "死神",
    englishName: "DEATH",
    meaning: "一片叶子落下，门后的空气正在变得清新。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 50h30V17H31v33"/><path d="M31 33h1"/><path d="M14 20c9 1 14 6 14 14-8 0-13-5-14-14z"/><path d="M14 20l14 14M20 52h30"/></svg>`
  },
  {
    id: "temperance",
    name: "节制",
    englishName: "TEMPERANCE",
    meaning: "两只杯子之间，一线清水缓慢地交换方向。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M16 20h15l-2 15H18l-2-15zM33 30h15l-2 15H35l-2-15z"/><path d="M29 28c8-2 8 10 6 13"/><path d="M20 39h8M37 49h8"/></svg>`
  },
  {
    id: "the-devil",
    name: "恶魔",
    englishName: "THE DEVIL",
    meaning: "缠绕的细线松开一点，镜面映出原来的房间。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="14" width="26" height="36" rx="2"/><path d="M25 23c12-8 14 8 3 8-10 0-7 12 5 8 8-3 5-12-1-12"/><path d="M23 54h18"/></svg>`
  },
  {
    id: "the-tower",
    name: "高塔",
    englishName: "THE TOWER",
    meaning: "高处的一扇窗打开，让停滞的风穿过去。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M22 51l4-31h12l4 31H22z"/><path d="M24 20l4-8h8l4 8"/><path d="M29 30h6v8h-6zM18 51h28"/><path d="M45 14l-5 8M51 20l-7 4"/></svg>`
  },
  {
    id: "the-star",
    name: "星星",
    englishName: "THE STAR",
    meaning: "很远的微光没有催促，只在水面留下细纹。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 14l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12z"/><path d="M14 52c7-3 13-3 20 0s13 3 16 0"/><path d="M20 20l2 2M44 20l-2 2"/></svg>`
  },
  {
    id: "the-moon",
    name: "月亮",
    englishName: "THE MOON",
    meaning: "月面的缺口像一段未说完的安静句子。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M39 15c-12 2-18 15-12 25 5 9 17 11 25 4-10 2-18-6-18-15 0-6 2-10 5-14z"/><path d="M18 48c8-5 20-5 28 0"/><path d="M21 22l-4-3M23 16l-2-5"/></svg>`
  },
  {
    id: "the-sun",
    name: "太阳",
    englishName: "THE SUN",
    meaning: "窗帘被推开一角，房间重新看见自己的轮廓。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="10"/><path d="M32 14v6M32 44v6M14 32h6M44 32h6M19 19l4 4M41 41l4 4M45 19l-4 4M23 41l-4 4"/></svg>`
  },
  {
    id: "judgement",
    name: "审判",
    englishName: "JUDGEMENT",
    meaning: "回声一圈圈上升，旧日的窗被轻轻推开。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M19 46V22h26v24"/><path d="M25 46V30h14v16"/><path d="M32 17v23M26 23l6-6 6 6"/><path d="M14 50h36"/></svg>`
  },
  {
    id: "the-world",
    name: "世界",
    englishName: "THE WORLD",
    meaning: "一条环线绕回原处，沿途已收进新的景色。",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="20"/><path d="M18 23c8 4 20 4 28 0M18 41c8-4 20-4 28 0M32 12c-7 8-7 32 0 40M32 12c7 8 7 32 0 40"/></svg>`
  }
];

export const giftItems = [
  {
    id: "warm-coffee",
    name: "一杯温热的咖啡",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 24h25v25H18z"/><path d="M43 29h5c5 0 5 12 0 12h-5"/><path d="M24 18c-3 3 3 5 0 8M32 17c-3 3 3 5 0 8"/></svg>`
  },
  {
    id: "dried-rose",
    name: "一朵枯玫瑰",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 31v22M32 43l-8-5M32 47l8-5"/><path d="M24 29c-4-9 3-16 8-11 5-5 12 2 8 11-4 6-12 6-16 0z"/><path d="M26 23l6 8 6-8"/></svg>`
  },
  {
    id: "old-key",
    name: "一枚旧钥匙",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="25" r="9"/><path d="M30 31l17 17M42 43l4-4M38 39l4-4"/></svg>`
  },
  {
    id: "folded-paper",
    name: "一张折起的纸",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 16h24l7 8v24H17V16z"/><path d="M41 16v8h7M22 27l20 12M22 40l20-13"/></svg>`
  },
  {
    id: "small-lamp",
    name: "一盏小灯",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20 31h24l-4-14H24l-4 14zM24 31v15h16V31M19 50h26"/><path d="M32 12V8M18 18l-3-3M46 18l3-3"/></svg>`
  },
  {
    id: "open-book",
    name: "一本翻到中间的书",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M14 19c8-3 14 0 18 5 4-5 10-8 18-5v27c-8-3-14 0-18 5-4-5-10-8-18-5V19z"/><path d="M32 24v27"/></svg>`
  },
  {
    id: "blank-ticket",
    name: "一张空白车票",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M14 23h36v18H14z"/><path d="M22 23v18M28 29h15M28 35h10"/><path d="M18 27v2M18 35v2"/></svg>`
  },
  {
    id: "old-recording",
    name: "一段旧录音",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="20" width="32" height="25" rx="3"/><circle cx="27" cy="32" r="5"/><path d="M37 27v10M41 25v14M45 29v6M20 50h24"/></svg>`
  },
  {
    id: "kept-leaf",
    name: "一片被保留的叶子",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M15 18c21 1 31 11 31 30-19 0-30-10-31-30z"/><path d="M17 20l27 27M28 31l-1 9M35 38l8-1"/></svg>`
  },
  {
    id: "paper-boat",
    name: "一只纸船",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M14 39l18-18 18 18-18 8-18-8z"/><path d="M14 39h36M32 21v26"/><path d="M18 52c8-3 18-3 28 0"/></svg>`
  },
  {
    id: "glass-marble",
    name: "一颗玻璃珠",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="16"/><path d="M22 27c3-6 9-9 15-8M21 40c5 5 13 7 20 3"/></svg>`
  },
  {
    id: "transparent-umbrella",
    name: "一把透明雨伞",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M13 32c4-14 34-14 38 0-5-4-10 4-15 0-5 4-10-4-15 0-3-3-5-2-8 0z"/><path d="M32 20v27c0 5 7 5 7 1"/><path d="M22 32l10-12 10 12"/></svg>`
  },
  {
    id: "unsealed-letter",
    name: "一封未封口的信",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M15 22h34v24H15z"/><path d="M15 23l17 14 17-14M15 46l12-12M49 46L37 34"/><path d="M24 17h16"/></svg>`
  },
  {
    id: "button",
    name: "一枚纽扣",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="15"/><circle cx="27" cy="27" r="2"/><circle cx="37" cy="27" r="2"/><circle cx="27" cy="37" r="2"/><circle cx="37" cy="37" r="2"/></svg>`
  },
  {
    id: "old-pocket-watch",
    name: "一只旧怀表",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="34" r="15"/><path d="M28 16h8M32 19v-5M32 34l6-5M32 34v9"/><path d="M25 52h14"/></svg>`
  },
  {
    id: "matchstick",
    name: "一根火柴",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M29 48l10-22"/><path d="M36 18c4 4 3 9-2 11-5-3-5-8 2-11z"/><path d="M19 51h25"/></svg>`
  },
  {
    id: "headphones",
    name: "一只耳机",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 35v-4c0-19 30-19 30 0v4"/><path d="M17 35h8v13h-5c-2 0-3-2-3-4V35zM47 35h-8v13h5c2 0 3-2 3-4V35z"/></svg>`
  },
  {
    id: "small-umbrella",
    name: "一把小小的伞",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M15 31c5-13 29-13 34 0-5-4-9 3-13 0-4 3-8-4-12 0-3-3-6-2-9 0z"/><path d="M32 20v28c0 5 6 5 7 1"/><path d="M32 20l-8 11M32 20l8 11"/></svg>`
  },
  {
    id: "moon-pin",
    name: "一枚月亮别针",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M39 17c-12 3-16 17-9 26 6 7 16 7 22 1-10 1-16-7-15-15 0-5 1-9 2-12z"/><path d="M23 43l-8 9M17 45l6 7"/></svg>`
  },
  {
    id: "polaroid-photo",
    name: "一张拍立得照片",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 14h30v36H17z"/><path d="M22 34l7-8 6 6 4-4 4 6H22z"/><circle cx="27" cy="22" r="2"/><path d="M24 44h16"/></svg>`
  },
  {
    id: "rounded-stone",
    name: "一块磨圆的石头",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 38c0-12 8-21 18-21 9 0 15 7 15 17 0 11-8 16-19 16-8 0-14-4-14-12z"/><path d="M24 38c5 3 11 3 16 0"/></svg>`
  },
  {
    id: "message-bottle",
    name: "一只漂流瓶",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M27 14h10v8l7 9v15c0 4-3 6-7 6H27c-4 0-7-2-7-6V31l7-9v-8z"/><path d="M24 35h16v10H24zM27 14h10"/><path d="M14 55c8-3 18-3 28 0"/></svg>`
  },
  {
    id: "wind-chimes",
    name: "一串风铃",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 17h28M24 17v22M32 17v29M40 17v22"/><path d="M20 39h8v8h-8zM28 46h8v8h-8zM36 39h8v8h-8z"/><path d="M32 54v4"/></svg>`
  },
  {
    id: "unfinished-pencil",
    name: "一支还未削完的铅笔",
    svg: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20 45l25-25 6 6-25 25-9 2 3-8z"/><path d="M40 25l6 6M20 45l6 6M45 20l3-3 6 6-3 3"/></svg>`
  }
];
