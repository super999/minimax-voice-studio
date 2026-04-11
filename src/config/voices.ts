export interface Voice {
  id: string
  name: string
  language: string
  category: string
}

export interface VoiceGroup {
  language: string
  voices: Voice[]
}

// Default voices to show when user has no favorites
export const DEFAULT_VOICE_IDS = [
  'female-shaonv',
  'female-tianmei',
  'female-yujie',
  'male-qn-jingying',
  'male-qn-qingse',
  'Chinese_Mandarin_News_Anchor',
  'English_Graceful_Lady',
  'Japanese_OptimisticYouth',
]

export const DEFAULT_VOICES: Voice[] = [
  { id: 'female-shaonv', name: '少女', language: 'Mandarin', category: 'Core' },
  { id: 'female-tianmei', name: '甜妹', language: 'Mandarin', category: 'Core' },
  { id: 'female-yujie', name: '御姐', language: 'Mandarin', category: 'Core' },
  { id: 'male-qn-jingying', name: '精英青年', language: 'Mandarin', category: 'Core' },
  { id: 'male-qn-qingse', name: '青涩', language: 'Mandarin', category: 'Core' },
  { id: 'Chinese_Mandarin_News_Anchor', name: '新闻主播', language: 'Mandarin', category: 'Core' },
  { id: 'English_Graceful_Lady', name: '优雅女士', language: 'English', category: 'Core' },
  { id: 'Japanese_OptimisticYouth', name: '乐观青年', language: 'Japanese', category: 'Core' },
]

export const VOICE_GROUPS: VoiceGroup[] = [
  {
    language: 'Mandarin',
    voices: [
      { id: 'female-shaonv', name: '少女', language: 'Mandarin', category: 'Core' },
      { id: 'female-tianmei', name: '甜妹', language: 'Mandarin', category: 'Core' },
      { id: 'female-yujie', name: '御姐', language: 'Mandarin', category: 'Core' },
      { id: 'male-qn-jingying', name: '精英青年', language: 'Mandarin', category: 'Core' },
      { id: 'male-qn-qingse', name: '青涩', language: 'Mandarin', category: 'Core' },
      { id: 'Chinese_Mandarin_News_Anchor', name: '新闻主播', language: 'Mandarin', category: 'Core' },
      { id: 'female-shaonv-jingpin', name: '少女-精品', language: 'Mandarin', category: 'Beta' },
      { id: 'male-qn-qingse-jingpin', name: '青涩-精品', language: 'Mandarin', category: 'Beta' },
      { id: 'clever_boy', name: '聪明男童', language: 'Mandarin', category: 'Character' },
      { id: 'cute_boy', name: '可爱男童', language: 'Mandarin', category: 'Character' },
      { id: 'lovely_girl', name: '萌萌女童', language: 'Mandarin', category: 'Character' },
      { id: 'cartoon_pig', name: '卡通猪小琪', language: 'Mandarin', category: 'Character' },
      { id: 'Robot_Armor', name: '机械战甲', language: 'Mandarin', category: 'Specialty' },
      { id: 'Chinese_Mandarin_Radio_Host', name: '电台男主播', language: 'Mandarin', category: 'Specialty' },
    ],
  },
  {
    language: 'Cantonese',
    voices: [
      { id: 'Cantonese_ProfessionalHost(F)', name: '专业女主持', language: 'Cantonese', category: 'Core' },
      { id: 'Cantonese_GentleLady', name: '温柔女声', language: 'Cantonese', category: 'Core' },
      { id: 'Cantonese_CuteGirl', name: '可爱女孩', language: 'Cantonese', category: 'Core' },
    ],
  },
  {
    language: 'English',
    voices: [
      { id: 'English_Trustworthy_Man', name: '可信男士', language: 'English', category: 'Core' },
      { id: 'English_Graceful_Lady', name: '优雅女士', language: 'English', category: 'Core' },
      { id: 'English_Aussie_Bloke', name: '澳洲男士', language: 'English', category: 'Core' },
      { id: 'English_Whispering_girl', name: '轻声女孩', language: 'English', category: 'Core' },
      { id: 'Santa_Claus', name: '圣诞老人', language: 'English', category: 'Holiday' },
      { id: 'Grinch', name: '绿毛怪', language: 'English', category: 'Holiday' },
      { id: 'Rudolph', name: '鲁道夫', language: 'English', category: 'Holiday' },
      { id: 'Arnold', name: '阿诺德', language: 'English', category: 'Holiday' },
    ],
  },
  {
    language: 'Japanese',
    voices: [
      { id: 'Japanese_IntellectualSenior', name: '知性前辈', language: 'Japanese', category: 'Core' },
      { id: 'Japanese_DecisivePrincess', name: '决断公主', language: 'Japanese', category: 'Core' },
      { id: 'Japanese_LoyalKnight', name: '忠诚骑士', language: 'Japanese', category: 'Core' },
      { id: 'Japanese_GentleButler', name: '温柔管家', language: 'Japanese', category: 'Core' },
      { id: 'Japanese_OptimisticYouth', name: '乐观青年', language: 'Japanese', category: 'Core' },
    ],
  },
  {
    language: 'Korean',
    voices: [
      { id: 'Korean_SweetGirl', name: '甜美女孩', language: 'Korean', category: 'Core' },
      { id: 'Korean_CheerfulBoyfriend', name: '阳光男友', language: 'Korean', category: 'Core' },
      { id: 'Korean_EnchantingSister', name: '迷人姐姐', language: 'Korean', category: 'Core' },
      { id: 'Korean_StrictBoss', name: '严格上司', language: 'Korean', category: 'Core' },
      { id: 'Korean_SassyGirl', name: '傲娇女孩', language: 'Korean', category: 'Core' },
      { id: 'Korean_BraveFemaleWarrior', name: '勇敢女战士', language: 'Korean', category: 'Core' },
    ],
  },
  {
    language: 'Spanish',
    voices: [
      { id: 'Spanish_SereneWoman', name: '宁静女性', language: 'Spanish', category: 'Core' },
      { id: 'Spanish_CaptivatingStoryteller', name: '魅力讲故事者', language: 'Spanish', category: 'Core' },
      { id: 'Spanish_Narrator', name: '旁白', language: 'Spanish', category: 'Core' },
      { id: 'Spanish_WiseScholar', name: '睿智学者', language: 'Spanish', category: 'Core' },
      { id: 'Spanish_AnimeCharacter', name: '动漫角色', language: 'Spanish', category: 'Specialty' },
      { id: 'Spanish_SantaClaus', name: '圣诞老人', language: 'Spanish', category: 'Holiday' },
    ],
  },
  {
    language: 'Portuguese',
    voices: [
      { id: 'Portuguese_SentimentalLady', name: '感伤女士', language: 'Portuguese', category: 'Core' },
      { id: 'Portuguese_Godfather', name: '教父', language: 'Portuguese', category: 'Core' },
      { id: 'Portuguese_SmartYoungGirl', name: '聪明少女', language: 'Portuguese', category: 'Core' },
      { id: 'Portuguese_CharmingQueen', name: '魅力女王', language: 'Portuguese', category: 'Core' },
    ],
  },
  {
    language: 'French',
    voices: [
      { id: 'French_Male_Speech_New', name: '稳重男士', language: 'French', category: 'Core' },
      { id: 'French_Female_News_Anchor', name: '新闻女主持', language: 'French', category: 'Core' },
      { id: 'French_CasualMan', name: '休闲男士', language: 'French', category: 'Core' },
      { id: 'French_MovieLeadFemale', name: '电影女主角', language: 'French', category: 'Core' },
    ],
  },
]

// Helper function to get voice by ID
export function getVoiceById(id: string): Voice | undefined {
  for (const group of VOICE_GROUPS) {
    const voice = group.voices.find(v => v.id === id)
    if (voice) return voice
  }
  return undefined
}

// Helper function to get display name for a voice ID
export function getVoiceDisplayName(id: string): string {
  const voice = getVoiceById(id)
  return voice ? `${voice.name} (${voice.language})` : id
}
