export interface BiomarkerDef {
  id: string;
  name: string;
  aliases: string[];
  unit: string;
  min: number;
  max: number;
  summary: string;
  lowQuestion: string;
  highQuestion: string;
}

export interface LabEntry {
  id: string;
  biomarkerId: string;
  value: number;
  date: string;
}

export const BIOMARKERS: BiomarkerDef[] = [
  {
    id: 'ferritin',
    name: 'Ferritin',
    aliases: ['ferritin'],
    unit: 'ng/mL',
    min: 15,
    max: 150,
    summary: 'Vücudun demir depolarını gösterir; düşüklüğü yorgunluk ve saç dökülmesiyle ilişkili olabilir.',
    lowQuestion: 'Ferritin depom düşük görünüyor; demir takviyesi veya beslenme düzeni gerekir mi?',
    highQuestion: 'Ferritin yüksekliğinin altında yatan inflamasyon veya başka bir neden araştırılmalı mı?',
  },
  {
    id: 'b12',
    name: 'Vitamin B12',
    aliases: ['b12', 'vitamin b12', 'kobalamin'],
    unit: 'pg/mL',
    min: 200,
    max: 900,
    summary: 'Sinir sistemi, enerji üretimi ve hafıza için kritik vitamindir.',
    lowQuestion: 'B12 seviyem sınırda/düşük; dil altı veya enjeksiyon formu önerir misiniz?',
    highQuestion: 'B12 yüksekliği mevcut takviyeden mi kaynaklanıyor, doz azaltmalı mıyım?',
  },
  {
    id: 'vitd',
    name: '25-OH D Vitamini',
    aliases: ['d vitamini', '25-oh', 'vitamin d', 'kolekalsiferol'],
    unit: 'ng/mL',
    min: 30,
    max: 80,
    summary: 'Kemik sağlığı, bağışıklık ve kas gücü üzerinde doğrudan rol oynar.',
    lowQuestion: 'D vitamini düzeyim için günlük idame veya yükleme dozu gerekir mi?',
    highQuestion: 'D vitamini yüksekliği nedeniyle kullandığım takviyeye ara vermeli miyim?',
  },
  {
    id: 'tsh',
    name: 'TSH',
    aliases: ['tsh', 'tiroid'],
    unit: 'mIU/L',
    min: 0.4,
    max: 4.0,
    summary: 'Tiroid bezinin çalışma hızını ve metabolizma dengesini yansıtır.',
    lowQuestion: 'TSH düşüklüğü için serbest T3/T4 ve tiroid antikorlarına bakılmalı mı?',
    highQuestion: 'TSH yüksekliği hipotiroidi başlangıcı olabilir mi, kontrol süresi ne olmalı?',
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    aliases: ['hba1c', 'glikozile hemoglobin'],
    unit: '%',
    min: 4.0,
    max: 5.6,
    summary: 'Son 2–3 aylık ortalama kan şekeri düzeyini gösterir.',
    lowQuestion: 'HbA1c değerim referansın altında; hipoglisemi riski değerlendirilmeli mi?',
    highQuestion: 'HbA1c yükselişi için insülin direnci veya OGTT testi önerir misiniz?',
  },
  {
    id: 'glucose',
    name: 'Açlık Glukozu',
    aliases: ['glukoz', 'açlık kan şekeri', 'kan şekeri', 'glikoz'],
    unit: 'mg/dL',
    min: 70,
    max: 99,
    summary: 'Açlık halindeki anlık kan şekeri ölçümüdür.',
    lowQuestion: 'Açlık şekerim düşük çıktı; öğün düzenimde değişiklik gerekir mi?',
    highQuestion: 'Açlık glukozum sınırda/yüksek; HbA1c ve açlık insülini baktırmalı mıyım?',
  },
  {
    id: 'hgb',
    name: 'Hemoglobin (HGB)',
    aliases: ['hemoglobin', 'hgb'],
    unit: 'g/dL',
    min: 12.0,
    max: 17.0,
    summary: 'Dokulara oksijen taşıyan kırmızı kan hücresi proteinidir.',
    lowQuestion: 'Hemoglobin düşüklüğü için anemi alt tipi (demir, B12, folat) incelenmeli mi?',
    highQuestion: 'Hemoglobin yüksekliği sıvı azlığından mı yoksa başka bir sebepten mi?',
  },
  {
    id: 'ldl',
    name: 'LDL Kolesterol',
    aliases: ['ldl', 'ldl kolesterol'],
    unit: 'mg/dL',
    min: 0,
    max: 130,
    summary: 'Damar sağlığı açısından takip edilen kolesterol alt tipidir.',
    lowQuestion: 'LDL değerim oldukça düşük; mevcut beslenme/ilaç düzenim uygun mu?',
    highQuestion: 'LDL yüksekliği için beslenme değişikliği yeterli mi, yoksa ilaç değerlendirmeli miyiz?',
  },
  {
    id: 'hdl',
    name: 'HDL Kolesterol',
    aliases: ['hdl', 'hdl kolesterol'],
    unit: 'mg/dL',
    min: 40,
    max: 90,
    summary: 'Damar koruyucu etkiye sahip iyi huylu kolesterol olarak bilinir.',
    lowQuestion: 'HDL’yi yükseltmek için egzersiz ve sağlıklı yağ oranımı nasıl düzenlemeliyim?',
    highQuestion: 'HDL yüksekliğim total kolesterol oranıyla birlikte normal mi?',
  },
  {
    id: 'triglyceride',
    name: 'Trigliserit',
    aliases: ['trigliserit', 'triglyceride'],
    unit: 'mg/dL',
    min: 0,
    max: 150,
    summary: 'Kandaki yağ enerji depolarını gösterir; şeker ve rafine karbonhidrattan etkilenir.',
    lowQuestion: 'Trigliserit değerim normal/düşük; diyetimde dikkat etmem gereken bir şey var mı?',
    highQuestion: 'Trigliserit yüksekliği için omega-3 veya karbonhidrat kısıtlaması önerir misiniz?',
  },
  {
    id: 'crp',
    name: 'CRP',
    aliases: ['crp', 'c-reaktif'],
    unit: 'mg/L',
    min: 0,
    max: 5.0,
    summary: 'Vücuttaki enfeksiyon veya inflamasyon (iltihap) durumunu gösteren belirteçtir.',
    lowQuestion: 'CRP normal aralıkta; mevcut belirtilerim başka bir nedene bağlı olabilir mi?',
    highQuestion: 'CRP yüksekliği geçici bir enfeksiyondan mı kaynaklanıyor, ne zaman tekrarlamalıyım?',
  },
  {
    id: 'alt',
    name: 'ALT (SGPT)',
    aliases: ['alt', 'sgpt', 'alanin aminotransferaz'],
    unit: 'U/L',
    min: 0,
    max: 40,
    summary: 'Karaciğer hücre sağlığını izlemede kullanılan temel enzimdir.',
    lowQuestion: 'ALT değerim normal sınırda görünüyor.',
    highQuestion: 'ALT yüksekliği karaciğer yağlanması veya kullandığım ilaç/takviyelerle ilgili olabilir mi?',
  },
  {
    id: 'ast',
    name: 'AST (SGOT)',
    aliases: ['ast', 'sgot', 'aspartat'],
    unit: 'U/L',
    min: 0,
    max: 40,
    summary: 'Karaciğer ve kas dokusu sağlığını değerlendirmede ALT ile birlikte okunur.',
    lowQuestion: 'AST değerim normal aralıkta.',
    highQuestion: 'AST/ALT oranım karaciğer veya yoğun egzersiz kaynaklı bir durum gösteriyor mu?',
  },
  {
    id: 'creatinine',
    name: 'Kreatinin',
    aliases: ['kreatinin', 'creatinine'],
    unit: 'mg/dL',
    min: 0.6,
    max: 1.2,
    summary: 'Böbrek süzme fonksiyonu ve kas metabolizması hakkında bilgi verir.',
    lowQuestion: 'Kreatinin düşüklüğü kas kütlesiyle mi ilişkili?',
    highQuestion: 'Kreatinin yüksekliği sıvı tüketimi, spor takviyesi veya böbrek fonksiyonuyla ilgili mi?',
  },
  {
    id: 'folate',
    name: 'Folat (Folik Asit)',
    aliases: ['folat', 'folik asit', 'vitamin b9'],
    unit: 'ng/mL',
    min: 4.0,
    max: 20.0,
    summary: 'Hücre yenilenmesi ve kan yapımı için B12 ile birlikte çalışan temel vitamindir.',
    lowQuestion: 'Folat eksikliğim B12 veya kansızlıkla birlikte değerlendirilmeli mi?',
    highQuestion: 'Folat yüksekliği mevcut multivitamin kullanımından mı kaynaklanıyor?',
  },
  {
    id: 'iron',
    name: 'Demir (Serum)',
    aliases: ['demir', 'serum demir', 'iron'],
    unit: 'µg/dL',
    min: 50,
    max: 170,
    summary: 'Kandaki dolaşan demir miktarını gösterir; Ferritin ile birlikte yorumlanır.',
    lowQuestion: 'Serum demirim düşük; toplam demir bağlama kapasitesi ve ferritin birlikte nasıl?',
    highQuestion: 'Demir yüksekliğim açlık/tokluk veya takviye saatine bağlı olabilir mi?',
  },
  {
    id: 'magnesium',
    name: 'Magnezyum',
    aliases: ['magnezyum', 'magnesium'],
    unit: 'mg/dL',
    min: 1.7,
    max: 2.5,
    summary: 'Kas krampları, sinir iletimi ve uyku kalitesi için önemli mineraldir.',
    lowQuestion: 'Magnezyum düşüklüğü için beslenme veya glisinat/sitrat formu gerekir mi?',
    highQuestion: 'Magnezyum yüksekliği böbrek fonksiyonu veya takviye dozundan mı?',
  },
  {
    id: 'uric_acid',
    name: 'Ürik Asit',
    aliases: ['ürik asit', 'uric acid'],
    unit: 'mg/dL',
    min: 2.5,
    max: 7.0,
    summary: 'Pürin metabolizmasının son ürünüdür; eklem ve böbrek sağlığı için izlenir.',
    lowQuestion: 'Ürik asit değerim normal/düşük sınırda.',
    highQuestion: 'Ürik asit yüksekliği için beslenmemde kırmızı et/fruktoz kısıtlaması gerekir mi?',
  },
];

export function parseLabText(raw: string): Array<{ biomarkerId: string; value: number }> {
  const lines = raw
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  const found: Array<{ biomarkerId: string; value: number }> = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const lower = line.toLocaleLowerCase('tr-TR');
    const def = BIOMARKERS.find((b) =>
      b.aliases.some((al) => {
        const escaped = al.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(^|[^a-zçğıöşü0-9])${escaped}([^a-zçğıöşü0-9]|$)`, 'i').test(lower);
      })
    );
    if (!def || seen.has(def.id)) continue;

    // Strip alias text and reference ranges (e.g. "15 - 150" or "15-150") before picking measured value
    let cleaned = lower;
    for (const al of def.aliases) {
      cleaned = cleaned.replace(al, ' ');
    }
    cleaned = cleaned.replace(/\d+(?:[.,]\d+)?\s*[-–]\s*\d+(?:[.,]\d+)?/g, ' ');
    const match = cleaned.replace(/,/g, '.').match(/(?:^|[\s:=])(\d+(?:\.\d+)?)/);
    if (!match) continue;
    const val = Number(match[1]);
    if (Number.isFinite(val) && val > 0) {
      seen.add(def.id);
      found.push({ biomarkerId: def.id, value: val });
    }
  }
  return found;
}
