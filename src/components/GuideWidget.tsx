import { useEffect, useState } from 'react';
import { Activity, BookOpen, FileUp, HelpCircle, ShieldAlert, X } from 'lucide-react';

const GUIDE_STEPS = [
  {
    icon: FileUp,
    badge: '01 · ÇEVRİMDIŞI PDF VEYA METİN',
    title: 'Laboratuvar PDF Yükle veya Yapıştır',
    desc: 'Laboratuvar sonuç PDF dosyanızı seçin ya da sonuç satırlarını kopyalayıp yapıştırın. PDF tamamen tarayıcınızda ayrıştırılır; hiçbir sunucuya yüklenmez.',
  },
  {
    icon: Activity,
    badge: '02 · REFERANS ARALIKLARI & TREND',
    title: 'Biyobelirteç & Geçmiş Karşılaştırması',
    desc: 'Hemogram, vitamin, tiroit ve biyokimya değerlerinin standart referans aralıklarındaki konumunu ve önceki ölçümlerle değişimini izleyin.',
  },
  {
    icon: HelpCircle,
    badge: '03 · HEKİME SORULACAK SORULAR',
    title: 'Muayene Öncesi Hazır Notlar',
    desc: 'Referans dışı görünen değerler için doktorunuza sorabileceğiniz bilgilendirici soru listesi otomatik oluşturulur.',
  },
  {
    icon: ShieldAlert,
    badge: '04 · TIBBİ BİLGİLENDİRME',
    title: 'Tanı veya Tedavi Yerine Geçmez',
    desc: 'KanTahlilim tıbbi cihaz değildir ve tanı koymaz. Sonuçlarınızı mutlaka hekiminizle değerlendirin; acil durumda 112 Acil’i arayın.',
  },
];

export function GuideWidget() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('rehber') === '1' || window.location.hash === '#rehber';
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="KanTahlilim kullanım rehberini aç"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[#111827]/20 bg-[#0F4C81] hover:bg-[#0B3961] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
      >
        <BookOpen className="w-4 h-4" />
        <span>Rehber</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-guide-title"
        >
          <div
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto border border-[#111827] bg-[#FAF8F5] text-[#111827] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#111827] bg-white px-5 py-4">
              <div>
                <div className="font-clinical-mono text-[10px] font-bold uppercase tracking-wider text-[#0F4C81]">
                  KanTahlilim Kullanım Kılavuzu
                </div>
                <h2 id="app-guide-title" className="font-clinical-serif text-xl font-bold">
                  Sonuçlar Nasıl İncelenir?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Rehberi kapat"
                className="p-1.5 border border-[#111827]/30 bg-[#FAF8F5] hover:bg-white cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0F4C81]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {GUIDE_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.badge}
                    className="border border-[#111827]/20 bg-white p-3.5 flex items-start gap-3"
                  >
                    <div className="shrink-0 bg-[#EFF6FF] border border-[#0F4C81]/30 text-[#0F4C81] p-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-clinical-mono text-[10px] font-bold text-[#0F4C81]">
                        {step.badge}
                      </div>
                      <h3 className="text-sm font-bold">{step.title}</h3>
                      <p className="text-xs text-[#4B5563] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#111827]/20 px-5 py-3 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-[#0F4C81] hover:bg-[#0B3961] text-white px-4 py-2 text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#111827]"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
