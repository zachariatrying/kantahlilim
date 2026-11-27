import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { GuideWidget } from './components/GuideWidget';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Download,
  FileUp,
  HelpCircle,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BIOMARKERS, parseLabText, type LabEntry } from './data/biomarkers';
import { extractLabTextFromPdf } from './utils/pdfExtractor';

const STORAGE_KEY = 'kantahlilim_entries_v1';

function loadEntries(): LabEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LabEntry[];
  } catch {}
  return [
    { id: 'e-1', biomarkerId: 'ferritin', value: 14, date: '2026-11-10' },
    { id: 'e-2', biomarkerId: 'b12', value: 215, date: '2026-11-10' },
    { id: 'e-3', biomarkerId: 'vitd', value: 19, date: '2026-11-10' },
    { id: 'e-4', biomarkerId: 'tsh', value: 2.1, date: '2026-11-10' },
  ];
}

export default function App() {
  const [entries, setEntries] = useState<LabEntry[]>(() => loadEntries());
  const [pasteText, setPasteText] = useState('');
  const [pasteMsg, setPasteMsg] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(BIOMARKERS[0].id);
  const [manualVal, setManualVal] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [kvkkOpen, setKvkkOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  const latestByMarker = useMemo(() => {
    const map = new Map<string, { latest: LabEntry; previous?: LabEntry }>();
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    for (const e of sorted) {
      const prev = map.get(e.biomarkerId);
      if (!prev) map.set(e.biomarkerId, { latest: e });
      else if (!prev.previous) prev.previous = e;
    }
    return map;
  }, [entries]);

  const doctorQuestions = useMemo(() => {
    const qs: Array<{ marker: string; status: 'Düşük' | 'Yüksek'; question: string }> = [];
    for (const def of BIOMARKERS) {
      const rec = latestByMarker.get(def.id)?.latest;
      if (!rec) continue;
      if (rec.value < def.min) qs.push({ marker: def.name, status: 'Düşük', question: def.lowQuestion });
      else if (rec.value > def.max) qs.push({ marker: def.name, status: 'Yüksek', question: def.highQuestion });
    }
    return qs;
  }, [latestByMarker]);

  const appendParsedResults = (parsed: Array<{ biomarkerId: string; value: number }>, sourceLabel: string) => {
    if (parsed.length === 0) {
      setPasteMsg(`${sourceLabel} içinde tanınabilir tahlil satırı bulunamadı (örn: "Ferritin 14", "B12 210").`);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setEntries((prev) => [
      ...parsed.map((p, i) => ({
        id: `e-${Date.now()}-${i}`,
        biomarkerId: p.biomarkerId,
        value: p.value,
        date: today,
      })),
      ...prev,
    ]);
    setPasteMsg(`${sourceLabel}: ${parsed.length} tahlil değeri cihazına eklendi.`);
  };

  const handleParsePaste = () => {
    const parsed = parseLabText(pasteText);
    appendParsedResults(parsed, 'Metin');
    if (parsed.length > 0) setPasteText('');
  };

  const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfLoading(true);
    setPasteMsg('PDF cihaz içinde okunuyor (sunucuya yüklenmez)...');
    try {
      const text = await extractLabTextFromPdf(file);
      const parsed = parseLabText(text);
      if (parsed.length === 0) {
        setPasteText(text.slice(0, 1200));
        setPasteMsg('PDF okundu ama otomatik satır eşleşmedi; metin kutusundan düzenleyebilirsin.');
      } else {
        appendParsedResults(parsed, `PDF (${file.name})`);
      }
    } catch {
      setPasteMsg('PDF okunamadı. Dosyanın şifreli veya yalnızca taranmış görsel olmadığından emin ol.');
    } finally {
      setPdfLoading(false);
      e.target.value = '';
    }
  };

  const handleManualAdd = (e: FormEvent) => {
    e.preventDefault();
    const val = Number(manualVal.replace(',', '.'));
    if (!Number.isFinite(val) || val <= 0) return;
    setEntries((prev) => [
      { id: `e-${Date.now()}`, biomarkerId: selectedMarker, value: val, date: manualDate },
      ...prev,
    ]);
    setManualVal('');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kantahlilim-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as LabEntry[];
        if (Array.isArray(parsed)) setEntries(parsed);
      } catch {}
    };
    reader.readAsText(file);
  };

  const handlePurgeAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
    setConfirmDelete(false);
    setKvkkOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#111827]">
      <header className="mx-auto max-w-5xl w-full px-4 sm:px-6 pt-6 pb-4 border-b-2 border-[#111827]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}store-assets/kantahlilim_icon.png`}
              alt="KanTahlilim"
              className="w-10 h-10 border border-[#111827] object-cover"
            />
            <div>
              <h1 className="font-clinical-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none">
                KanTahlilim
              </h1>
              <p className="font-clinical-mono text-[11px] text-[#4B5563] mt-1">
                Cihaz İçi Laboratuvar PDF &amp; Kan Tahlili Föyü · Sunucusuz Analiz
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setKvkkOpen(true)}
            className="inline-flex items-center gap-1.5 border border-[#111827] bg-white px-3.5 py-2 text-xs font-semibold hover:bg-[#111827] hover:text-white transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            KVKK &amp; JSON Yedek
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl w-full flex-1 px-4 sm:px-6 py-6 space-y-8">
        {/* PDF Upload + Text Paste + Manual Entry */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#111827] bg-white lg:divide-x divide-y lg:divide-y-0 divide-[#111827]/20">
          {/* PDF Upload & Text Paste */}
          <div className="lg:col-span-7 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <FileUp className="w-4 h-4 text-[#0F4C81]" />
                Tahlil PDF Raporu Yükle veya Sonuç Yapıştır
              </div>
              <label className="inline-flex items-center gap-1.5 bg-[#0F4C81] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0B3961] cursor-pointer">
                <FileUp className="w-3.5 h-3.5" />
                {pdfLoading ? 'PDF Okunuyor...' : 'PDF Rapor Seç'}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={pdfLoading}
                  onChange={(e) => void handlePdfUpload(e)}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={3}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={'Veya laboratuvar sonuç metnini yapıştır:\nFerritin 14 ng/mL\nB12 215 pg/mL\nD Vitamini 19'}
              className="w-full border border-[#111827]/25 bg-[#FAF8F5] px-3 py-2 text-xs font-clinical-mono"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-[#4B5563]">
                PDF ve metinler %100 cihaz içinde işlenir; hiçbir sunucuya gönderilmez.
              </span>
              <button
                type="button"
                onClick={handleParsePaste}
                className="inline-flex items-center gap-1.5 border border-[#111827] bg-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#111827] hover:text-white cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5" /> Metni Çözümle
              </button>
            </div>
            {pasteMsg && (
              <div className="border border-[#0F4C81]/30 bg-[#EFF6FF] px-3 py-1.5 text-xs text-[#0F4C81]">
                {pasteMsg}
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualAdd} className="lg:col-span-5 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Plus className="w-4 h-4 text-[#0F4C81]" />
              Tekil Biyobelirteç Girişi
            </div>
            <select
              value={selectedMarker}
              onChange={(e) => setSelectedMarker(e.target.value)}
              className="w-full border border-[#111827]/25 bg-[#FAF8F5] px-3 py-2 text-sm"
            >
              {BIOMARKERS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.min}–{b.max} {b.unit})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={manualVal}
                onChange={(e) => setManualVal(e.target.value)}
                placeholder="Ölçüm (örn. 28.5)"
                className="border border-[#111827]/25 bg-[#FAF8F5] px-3 py-2 text-sm font-clinical-mono"
              />
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="border border-[#111827]/25 bg-[#FAF8F5] px-3 py-2 text-sm font-clinical-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#111827] py-2 text-xs font-bold text-white hover:bg-[#1F2937] cursor-pointer"
            >
              Föye İşle
            </button>
          </form>
        </section>

        {/* Horizontal Clinical Assay Table */}
        <section>
          <div className="flex items-baseline justify-between pb-2 border-b-2 border-[#111827]">
            <h2 className="font-clinical-serif text-xl font-bold">Laboratuvar Değerlendirme Cetveli</h2>
            <span className="font-clinical-mono text-xs text-[#4B5563]">
              {latestByMarker.size} / {BIOMARKERS.length} parametre kayıtlı
            </span>
          </div>

          <div className="divide-y divide-[#111827]/15 border-b border-[#111827] bg-white">
            {BIOMARKERS.map((def) => {
              const rec = latestByMarker.get(def.id);
              if (!rec) return null;
              const { latest, previous } = rec;
              const isLow = latest.value < def.min;
              const isHigh = latest.value > def.max;
              const statusText = isLow ? 'DÜŞÜK' : isHigh ? 'YÜKSEK' : 'REFERANS';
              const span = Math.max(1, def.max - def.min);
              const norm = ((latest.value - def.min) / span) * 50 + 25;
              const pinPct = Math.max(4, Math.min(96, norm));
              const delta = previous ? Number((latest.value - previous.value).toFixed(2)) : null;

              return (
                <article key={def.id} className="p-4 sm:px-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">{def.name}</h3>
                      <span className="font-clinical-mono text-[11px] text-[#4B5563]">{latest.date}</span>
                    </div>
                    <p className="font-clinical-serif italic text-sm text-[#4B5563] mt-0.5">{def.summary}</p>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <div className="relative h-3 w-full bg-[#F3F4F6] border border-[#111827]/20 flex">
                      <div className="w-1/4 bg-rose-100/70 border-r border-[#111827]/20" />
                      <div className="w-2/4 bg-emerald-100/80 border-r border-[#111827]/20" />
                      <div className="w-1/4 bg-rose-100/70" />
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border border-white ${
                          isLow || isHigh ? 'bg-[#B91C1C]' : 'bg-[#0F4C81]'
                        }`}
                        style={{ left: `${pinPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-clinical-mono text-[10px] text-[#4B5563]">
                      <span>&lt; {def.min}</span>
                      <span>Optimal: {def.min}–{def.max} {def.unit}</span>
                      <span>&gt; {def.max}</span>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
                    <div className="text-left md:text-right">
                      <div className="font-clinical-mono text-lg font-bold">
                        {latest.value} <span className="text-xs font-normal text-[#4B5563]">{def.unit}</span>
                      </div>
                      <div className="flex items-center md:justify-end gap-2">
                        <span
                          className={`inline-flex items-center gap-1 font-clinical-mono text-[10px] font-bold ${
                            isLow || isHigh ? 'text-[#B91C1C]' : 'text-[#15803D]'
                          }`}
                        >
                          {isLow || isHigh ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {statusText}
                        </span>
                        {delta !== null && (
                          <span className="font-clinical-mono text-[10px] text-[#0F4C81]">
                            ({delta >= 0 ? `+${delta}` : delta})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEntries((prev) => prev.filter((e) => e.id !== latest.id))}
                      className="p-1.5 text-[#6B7280] hover:text-[#B91C1C] cursor-pointer"
                      title="Son ölçümü sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {doctorQuestions.length > 0 && (
          <section className="legal-pad border border-[#111827] p-5 space-y-3">
            <h2 className="font-clinical-serif text-lg font-bold text-[#0F4C81] flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Hekimine Sorabileceğin Sorular ({doctorQuestions.length})
            </h2>
            <ul className="space-y-2">
              {doctorQuestions.map((q, idx) => (
                <li key={idx} className="text-xs sm:text-sm flex items-start gap-2.5 leading-7">
                  <span className="font-clinical-mono text-[11px] font-bold px-1.5 py-0.5 bg-white border border-[#111827] shrink-0">
                    {q.marker} · {q.status}
                  </span>
                  <span>{q.question}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-[#111827]/20 py-4 text-center text-[11px] text-[#4B5563] px-4 space-y-1.5">
        <p>
          KanTahlilim tıbbi cihaz değildir (1219 sayılı Kanun &amp; TİTCK kapsamında tanı/tedavi sunmaz) ve hiçbir resmî
          kamu kurumuyla bağlantısı yoktur. Acil durumlarda <strong>112 Acil</strong>&rsquo;i arayın; sonuçlarınızı
          mutlaka hekiminizle değerlendirin.
        </p>
        <p className="flex flex-wrap justify-center gap-3">
          <a href="https://medlineplus.gov/lab-tests/" target="_blank" rel="noopener noreferrer" className="underline">
            MedlinePlus (NIH)
          </a>
          <a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" className="underline">
            WHO
          </a>
          <a href="https://www.turkbiyokimyadernegi.org.tr/" target="_blank" rel="noopener noreferrer" className="underline">
            Türk Biyokimya Derneği
          </a>
          <a href="./privacy.html" className="underline font-bold">
            Gizlilik &amp; KVKK
          </a>
        </p>
      </footer>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border-2 border-[#111827] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#111827]/15 pb-3">
              <h2 className="font-clinical-serif text-lg font-bold">KVKK &amp; Tahlil Verisi Kontrolü</h2>
              <button type="button" onClick={() => setKvkkOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#4B5563]">Sağlık verileriniz sunucuya gönderilmez; tamamen cihazınızda saklanır.</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleExportJson} className="inline-flex items-center justify-center gap-1.5 border border-[#111827] py-2 text-xs font-bold cursor-pointer">
                <Download className="w-3.5 h-3.5" /> JSON İndir
              </button>
              <label className="inline-flex items-center justify-center gap-1.5 border border-[#111827] py-2 text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> JSON Yükle
                <input type="file" accept="application/json" className="hidden" onChange={(e) => handleImportJson(e.target.files?.[0])} />
              </label>
            </div>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="w-full border border-[#B91C1C] bg-rose-50 py-2 text-xs font-bold text-[#B91C1C] cursor-pointer">
                Tüm Tahlilleri Kalıcı Sil
              </button>
            ) : (
              <button type="button" onClick={handlePurgeAll} className="w-full bg-[#B91C1C] py-2 text-xs font-bold text-white cursor-pointer">
                Eminim, Tüm Kayıtları Sil
              </button>
            )}
          </div>
        </div>
      )}
      <GuideWidget />
    </div>
  );
}
