import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Download,
  HelpCircle,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BIOMARKERS, parseEnabizText, type LabEntry } from './data/biomarkers';

const STORAGE_KEY = 'kantahlilim_entries_v1';

function loadEntries(): LabEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LabEntry[];
  } catch {
    // Ignore storage errors
  }
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
  const [selectedMarker, setSelectedMarker] = useState(BIOMARKERS[0].id);
  const [manualVal, setManualVal] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [kvkkOpen, setKvkkOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota errors
    }
  }, [entries]);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const utm_source = sp.get('utm_source');
      const utm_campaign = sp.get('utm_campaign');
      if (utm_source || utm_campaign) {
        localStorage.setItem(
          'kantahlilim_utm_v1',
          JSON.stringify({ utm_source, utm_campaign, landedAt: new Date().toISOString() })
        );
      }
    } catch {
      // Ignore
    }
  }, []);

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
      if (rec.value < def.min) {
        qs.push({ marker: def.name, status: 'Düşük', question: def.lowQuestion });
      } else if (rec.value > def.max) {
        qs.push({ marker: def.name, status: 'Yüksek', question: def.highQuestion });
      }
    }
    return qs;
  }, [latestByMarker]);

  const handleParsePaste = () => {
    const parsed = parseEnabizText(pasteText);
    if (parsed.length === 0) {
      setPasteMsg('Tanınabilir bir tahlil satırı bulunamadı (örn: "Ferritin 14", "B12 210").');
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
    setPasteMsg(`${parsed.length} tahlil değeri cihazına eklendi.`);
    setPasteText('');
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
      } catch {
        // Ignore
      }
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
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <header className="sticky top-0 z-30 border-b border-[#1E40AF] bg-[#1D4ED8] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}store-assets/kantahlilim_icon.png`}
              alt="KanTahlilim"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-none">KanTahlilim</h1>
              <p className="text-[11px] text-[#DBEAFE] hidden sm:block mt-0.5">
                %100 cihaz içi e-Nabız tahlil &amp; trend okuyucu (sunucuya veri gitmez)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setKvkkOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KVKK &amp; Yedek</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl w-full flex-1 px-4 sm:px-6 py-6 space-y-6">
        {/* Input Row: e-Nabız Paste + Manual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-2xl border border-[#DCE4F0] bg-white p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#0F172A]">
              <ClipboardPaste className="w-4 h-4 text-[#1D4ED8]" />
              e-Nabız Sonuç Metnini Yapıştır
            </div>
            <textarea
              rows={3}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={'Örnek:\nFerritin 14 ng/mL\nB12 215 pg/mL\nD Vitamini 19'}
              className="w-full rounded-xl border border-[#DCE4F0] bg-[#F8FAFC] px-3 py-2 text-xs"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#64748B]">Veriler yalnızca cihazında işlenir.</span>
              <button
                type="button"
                onClick={handleParsePaste}
                className="rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E40AF] cursor-pointer"
              >
                Metni Çözümle
              </button>
            </div>
            {pasteMsg && (
              <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 text-xs text-[#1E40AF]">
                {pasteMsg}
              </div>
            )}
          </section>

          <form
            onSubmit={handleManualAdd}
            className="rounded-2xl border border-[#DCE4F0] bg-white p-4 space-y-2.5"
          >
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#0F172A]">
              <Plus className="w-4 h-4 text-[#1D4ED8]" />
              Tekil Tahlil Değeri Ekle
            </div>
            <select
              value={selectedMarker}
              onChange={(e) => setSelectedMarker(e.target.value)}
              className="w-full rounded-xl border border-[#DCE4F0] bg-[#F8FAFC] px-3 py-2 text-sm"
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
                placeholder="Değer (örn. 28.5)"
                className="rounded-xl border border-[#DCE4F0] bg-[#F8FAFC] px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="rounded-xl border border-[#DCE4F0] bg-[#F8FAFC] px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#0F172A] py-2 text-xs font-bold text-white hover:bg-[#1E293B] cursor-pointer"
            >
              Kaydı Ekle
            </button>
          </form>
        </div>

        {/* Doctor Questions */}
        {doctorQuestions.length > 0 && (
          <section className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#92400E]">
              <HelpCircle className="w-4 h-4 text-[#D97706]" />
              Doktoruna Sorabileceğin Sorular ({doctorQuestions.length})
            </div>
            <ul className="space-y-1.5">
              {doctorQuestions.map((q, idx) => (
                <li key={idx} className="text-xs text-[#78350F] flex items-start gap-2">
                  <span className="shrink-0 rounded bg-[#FEF3C7] border border-[#FCD34D] px-1.5 py-0.5 text-[10px] font-bold">
                    {q.marker} ({q.status})
                  </span>
                  <span>{q.question}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Biomarker Cards with Reference Range Bars */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BIOMARKERS.map((def) => {
            const rec = latestByMarker.get(def.id);
            if (!rec) return null;
            const { latest, previous } = rec;
            const isLow = latest.value < def.min;
            const isHigh = latest.value > def.max;
            const statusText = isLow ? 'Düşük' : isHigh ? 'Yüksek' : 'Referans Aralığında';
            const badgeCls = isLow || isHigh
              ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
              : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
            const span = Math.max(1, def.max - def.min);
            const pct = Math.max(4, Math.min(96, ((latest.value - def.min) / span) * 100));
            const delta = previous ? Number((latest.value - previous.value).toFixed(2)) : null;

            return (
              <article
                key={def.id}
                className="rounded-2xl border border-[#DCE4F0] bg-white p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#1D4ED8]" />
                      <h2 className="text-sm font-extrabold text-[#0F172A]">{def.name}</h2>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Ref: {def.min}–{def.max} {def.unit} · {latest.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-[#0F172A] tabular-nums">
                      {latest.value} <span className="text-xs font-semibold text-[#64748B]">{def.unit}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeCls}`}>
                      {isLow || isHigh ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="h-2.5 w-full rounded-full bg-[#E2E8F0] relative overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isLow || isHigh ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-[#475569]">
                  <p className="flex-1">{def.summary}</p>
                  {delta !== null && (
                    <span className="shrink-0 font-bold tabular-nums text-[#1D4ED8]">
                      Öncekine göre {delta >= 0 ? `+${delta}` : delta}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setEntries((prev) => prev.filter((e) => e.id !== latest.id))}
                    className="p-1 text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"
                    title="Son ölçümü sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-[#DCE4F0] bg-white py-3.5 text-center text-[11px] text-[#475569] px-4">
        KanTahlilim tıbbi teşhis veya tedavi tavsiyesi değildir; sonuçlarınızı mutlaka hekiminizle değerlendirin. Verileriniz yalnızca cihazınızda tutulur.
      </footer>

      {kvkkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#0F172A]">KVKK &amp; Tahlil Verisi Kontrolü</h2>
              <button type="button" onClick={() => setKvkkOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#475569]">
              Sağlık verileriniz hiçbir sunucuya gönderilmez; tamamen cihazınızda saklanır.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCE4F0] py-2 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> JSON İndir
              </button>
              <label className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DCE4F0] py-2 text-xs font-bold cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> JSON Yükle
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => handleImportJson(e.target.files?.[0])}
                />
              </label>
            </div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-xl border border-[#FECACA] bg-[#FEF2F2] py-2 text-xs font-bold text-[#B91C1C] cursor-pointer"
              >
                Tüm Tahlilleri Kalıcı Sil
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePurgeAll}
                className="w-full rounded-xl bg-[#DC2626] py-2 text-xs font-bold text-white cursor-pointer"
              >
                Eminim, Tüm Kayıtları Sil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
