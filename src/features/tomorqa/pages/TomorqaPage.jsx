// Toast
import { toast } from "sonner";

// React
import { useState, useEffect, useRef } from "react";

// API
import { authAPI } from "@/shared/api";
import { tomorqaAPI } from "@/features/tomorqa/api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { SEASON_OPTIONS, YEAR_OPTIONS, TOMORQA_TABS } from "@/features/tomorqa/data/tomorqa.data";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Icons
import { Trash2, Sprout, BrainCircuit, TrendingUp, BarChart2, Info } from "lucide-react";

// ─── Shared select style ────────────────────────────────────────────────────
const SELECT_CLS =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm";

const INPUT_CLS =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm";

// ─── CountUp hook ────────────────────────────────────────────────────────────
/**
 * Raqamni 0 dan target gacha animatsiya bilan ko'rsatadi.
 * @param {number} target - Maqsadli qiymat
 * @param {boolean} active - Animatsiya boshlansinmi
 * @param {number} [duration=1200] - Animatsiya davomiyligi (ms)
 * @returns {string} Hozirgi ko'rsatiladigan qiymat
 */
function useCountUp(target, active, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active || !target) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((target * eased).toFixed(1)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, active, duration]);

  return value;
}

// ─── HarvestEntryTab ─────────────────────────────────────────────────────────
/**
 * Hosilni kiritish tab komponenti.
 * Mahsulot/nav tanlash, maydon/miqdor kiritish va hosil tarixi ro'yxati.
 */
const HarvestEntryTab = ({ products }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { state: form, setField, setFields } = useObjectState({
    productId: "",
    varietyId: "",
    area: "",
    amount: "",
    year: String(new Date().getFullYear()),
    season: "",
  });

  const selectedProduct = products.find((p) => p._id === form.productId);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["harvest", "my", page],
    queryFn: () => tomorqaAPI.getMyHarvest({ page, limit: 10 }).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => tomorqaAPI.createHarvest(data),
    onSuccess: () => {
      toast.success("Hosil ma'lumoti muvaffaqiyatli saqlandi!");
      setFields({ productId: "", varietyId: "", area: "", amount: "", season: "" });
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["harvest", "my"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Saqlashda xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tomorqaAPI.deleteHarvest(id),
    onSuccess: () => {
      toast.success("Yozuv o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["harvest", "my"] });
    },
    onError: () => {
      toast.error("O'chirishda xatolik yuz berdi");
    },
  });

  const handleSubmit = () => {
    if (!form.productId) return toast.error("Mahsulotni tanlang");
    if (!form.varietyId) return toast.error("Navni tanlang");
    if (!form.area || Number(form.area) <= 0) return toast.error("Yer maydonini kiriting");
    if (!form.amount || Number(form.amount) < 0) return toast.error("Hosil miqdorini kiriting");

    createMutation.mutate({
      productId: form.productId,
      varietyId: form.varietyId,
      area: Number(form.area),
      amount: Number(form.amount),
      year: Number(form.year),
      season: form.season || undefined,
    });
  };

  const history = historyData?.data || [];
  const totalPages = historyData?.pages || 1;

  return (
    <div className="space-y-5">
      {/* Hosil kiritish formasi */}
      <Card title="Yangi hosil kiriting">
        <div className="space-y-3">
          {/* Mahsulot tanlash */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Mahsulot <span className="text-red-500">*</span>
            </label>
            <select
              className={SELECT_CLS}
              value={form.productId}
              onChange={(e) => setFields({ productId: e.target.value, varietyId: "" })}
            >
              <option value="">— Mahsulotni tanlang —</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nav tanlash */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nav <span className="text-red-500">*</span>
            </label>
            <select
              className={SELECT_CLS}
              value={form.varietyId}
              onChange={(e) => setField("varietyId", e.target.value)}
              disabled={!selectedProduct}
            >
              <option value="">— Navni tanlang —</option>
              {(selectedProduct?.varieties || []).map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Maydon va miqdor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Maydon (sotix) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={INPUT_CLS}
                placeholder="Masalan: 4"
                value={form.area}
                onChange={(e) => setField("area", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Hosil (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={INPUT_CLS}
                placeholder="Masalan: 240"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
              />
            </div>
          </div>

          {/* Yil va mavsum */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Yil</label>
              <select
                className={SELECT_CLS}
                value={form.year}
                onChange={(e) => setField("year", e.target.value)}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mavsum</label>
              <select
                className={SELECT_CLS}
                value={form.season}
                onChange={(e) => setField("season", e.target.value)}
              >
                {SEASON_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </Card>

      {/* Hosil tarixi */}
      <Card title="Hosil tarixi">
        {historyLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!historyLoading && history.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Hozircha hosil ma'lumotlari yo'q
          </div>
        )}

        {!historyLoading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h._id}
                className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0 size-9 rounded-lg bg-gradient-to-br from-lime-400 to-green-700 flex items-center justify-center">
                    <Sprout className="size-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {h.product?.name} — {h.varietyName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                      <span>{h.area} sotix</span>
                      <span>·</span>
                      <span>{h.amount} kg</span>
                      <span>·</span>
                      <span>{h.year}</span>
                      {h.season && (
                        <>
                          <span>·</span>
                          <span>{h.season}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatUzDate(h.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(h._id)}
                  disabled={deleteMutation.isPending}
                  className="flex-shrink-0 size-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="O'chirish"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {/* Sahifalash */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
                >
                  Oldingi
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
                >
                  Keyingi
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── ResultCard ──────────────────────────────────────────────────────────────
/**
 * Kalkulatsiya natijasini animatsiya bilan ko'rsatadi.
 * @param {{ result: object, productName: string, varietyName: string }} props
 */
const ResultCard = ({ result, productName, varietyName }) => {
  const [visible, setVisible] = useState(false);
  const avg = useCountUp(result?.avgPerSotix, visible);
  const min = useCountUp(result?.minPerSotix, visible);
  const max = useCountUp(result?.maxPerSotix, visible);

  useEffect(() => {
    if (!result) return;
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) return null;

  return (
    <div
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-5 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800 text-sm">
              {productName} — {varietyName}
            </p>
            <p className="text-xs text-emerald-600">
              {result.count} ta ma'lumot asosida hisoblandi
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <TrendingUp className="size-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{avg}</p>
            <p className="text-xs text-gray-500 mt-0.5">O'rtacha kg/sotix</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <BarChart2 className="size-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{min}</p>
            <p className="text-xs text-gray-500 mt-0.5">Minimal kg/sotix</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <BarChart2 className="size-4 text-orange-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{max}</p>
            <p className="text-xs text-gray-500 mt-0.5">Maksimal kg/sotix</p>
          </div>
        </div>

        {/* Interpretation */}
        <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-3 text-xs text-emerald-700">
          <Info className="size-3.5 mt-0.5 flex-shrink-0" />
          <p>
            Sizning hududingizdagi {productName} ({varietyName}) navidan 1 sotix yerda o'rtacha{" "}
            <strong>{avg} kg</strong> hosil olish mumkin.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── CalculatorTab ───────────────────────────────────────────────────────────
/**
 * AI-uslubdagi hosil kalkulatori.
 * Foydalanuvchining hududiga ko'ra mahsulot/nav bo'yicha o'rtacha hosil hisoblanadi.
 */
const CalculatorTab = ({ products }) => {
  const { state: form, setField, setFields } = useObjectState({
    productId: "",
    varietyId: "",
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const selectedProduct = products.find((p) => p._id === form.productId);

  const regionId = user?.address?.region;

  const {
    data: calcData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["harvest", "calc", form.productId, form.varietyId, regionId],
    queryFn: () =>
      tomorqaAPI
        .getCalculation({
          productId: form.productId,
          varietyId: form.varietyId,
          regionId: regionId || undefined,
        })
        .then((res) => res.data),
    enabled: false,
    retry: false,
  });

  const handleCalc = () => {
    if (!form.productId) return toast.error("Mahsulotni tanlang");
    if (!form.varietyId) return toast.error("Navni tanlang");
    setHasSearched(true);
    refetch();
  };

  // First matching result for selected product+variety
  const result =
    calcData?.find(
      (r) =>
        String(r.varietyId) === String(form.varietyId)
    ) || null;

  return (
    <div className="space-y-5">
      <Card title="Hosil kalkulatsiyasi">
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Mahsulot va navini tanlang. Tizim sizning hududingiz bo'yicha yig'ilgan
            ma'lumotlar asosida taxminiy hosil miqdorini hisoblaydi.
          </p>

          {/* Mahsulot */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Mahsulot</label>
            <select
              className={SELECT_CLS}
              value={form.productId}
              onChange={(e) => setFields({ productId: e.target.value, varietyId: "" })}
            >
              <option value="">— Mahsulotni tanlang —</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nav */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nav</label>
            <select
              className={SELECT_CLS}
              value={form.varietyId}
              onChange={(e) => setField("varietyId", e.target.value)}
              disabled={!selectedProduct}
            >
              <option value="">— Navni tanlang —</option>
              {(selectedProduct?.varieties || []).map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCalc}
            disabled={isFetching}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <BrainCircuit className="size-4" />
            {isFetching ? "Hisoblanyapti..." : "Hisoblash"}
          </button>
        </div>
      </Card>

      {/* AI calculating animation */}
      {isFetching && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-3">
          <style>{`
            @keyframes ai-breathe {
              0%, 100% { opacity: 0.4; transform: scale(0.97); }
              50% { opacity: 1; transform: scale(1.03); }
            }
            .ai-breathe { animation: ai-breathe 1.6s ease-in-out infinite; }
            @keyframes ai-dot { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
            .ai-dot-1 { animation: ai-dot 1.4s 0s infinite; }
            .ai-dot-2 { animation: ai-dot 1.4s 0.2s infinite; }
            .ai-dot-3 { animation: ai-dot 1.4s 0.4s infinite; }
          `}</style>
          <div className="ai-breathe size-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
            <BrainCircuit className="size-8 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-emerald-700">AI hisoblayapti</p>
            <p className="text-xs text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
              Ma'lumotlar tahlil qilinmoqda
              <span className="ai-dot-1 text-base leading-none">.</span>
              <span className="ai-dot-2 text-base leading-none">.</span>
              <span className="ai-dot-3 text-base leading-none">.</span>
            </p>
          </div>
        </div>
      )}

      {/* No data */}
      {!isFetching && hasSearched && !result && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-500">
          Hududingiz bo'yicha bu mahsulot va nav uchun ma'lumot topilmadi.
          <br />
          Boshqa fuqarolar ham hosil ma'lumotlari kiritishi bilan natija ko'rinadi.
        </div>
      )}

      {/* Result */}
      {!isFetching && result && (
        <ResultCard
          result={result}
          productName={selectedProduct?.name}
          varietyName={selectedProduct?.varieties?.find((v) => v._id === form.varietyId)?.name}
        />
      )}
    </div>
  );
};

// ─── TomorqaPage ─────────────────────────────────────────────────────────────
const TomorqaPage = () => {
  const [activeTab, setActiveTab] = useState("enter");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => tomorqaAPI.getProducts().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen pb-24 animate__animated animate__fadeIn">
      <BackHeader href="/dashboard" title="Mening tomorqam" />

      {/* Tab switcher */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="flex gap-2">
          {TOMORQA_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-5 space-y-5">
        {productsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "enter" && <HarvestEntryTab products={products} />}
            {activeTab === "calc" && <CalculatorTab products={products} />}
          </>
        )}
      </div>
    </div>
  );
};

export default TomorqaPage;
