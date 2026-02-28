// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Icons
import { MapPin, ChevronRight, Check } from "lucide-react";

// Data
import { HOUSE_TYPES } from "@/shared/data/house-types";

// API
import { regionsAPI, usersAPI } from "@/shared/api/http";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const STEPS = [
  { id: 1, label: "Viloyat" },
  { id: 2, label: "Tuman" },
  { id: 3, label: "Mahalla" },
  { id: 4, label: "Ko'cha" },
  { id: 5, label: "Uy" },
];

const StepBar = ({ currentStep }) => (
  <div className="flex items-center justify-between w-full relative mb-12">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500 ease-out"
      style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
    ></div>
    
    {STEPS.map((step) => {
      const isCompleted = step.id < currentStep;
      const isCurrent = step.id === currentStep;
      
      return (
        <div key={step.id} className="relative z-10 flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm ${
              isCompleted
                ? "bg-blue-600 text-white ring-4 ring-blue-50 scale-95"
                : isCurrent
                ? "bg-white text-blue-600 border-2 border-blue-600 ring-4 ring-blue-50 scale-110"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            {isCompleted ? <Check className="w-5 h-5" /> : step.id}
          </div>
          <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors ${
            isCurrent ? "text-blue-600" : isCompleted ? "text-slate-600" : "text-slate-400"
          }`}>
            {step.label}
          </span>
        </div>
      );
    })}
  </div>
);

const RegionSetupPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [form, setForm] = useState({
    region: "",
    district: "",
    neighborhood: "",
    street: "",
    neighborhoodCustom: "",
    streetCustom: "",
    houseType: "private",
    houseNumber: "",
    apartment: "",
    isNeighborhoodCustom: false,
    isStreetCustom: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => usersAPI.getProfile().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!profile?.address) return;
    if (profile.address.region || profile.address.region?._id) {
      navigate("/dashboard");
    }
  }, [navigate, profile]);

  useEffect(() => {
    if (isPrefilled || !profile?.address) return;

    const address = profile.address || {};
    const getId = (value) =>
      value && typeof value === "object" ? value._id : value || "";
    const neighborhoodId = getId(address.neighborhood);
    const streetId = getId(address.street);
    const isNeighborhoodCustom =
      !neighborhoodId && !!address.neighborhoodCustom;
    const isStreetCustom = !streetId && !!address.streetCustom;

    setForm((prev) => ({
      ...prev,
      region: getId(address.region),
      district: getId(address.district),
      neighborhood: neighborhoodId,
      street: streetId,
      neighborhoodCustom: address.neighborhoodCustom || "",
      streetCustom: address.streetCustom || "",
      houseType: address.houseType || "private",
      houseNumber: address.houseNumber || "",
      apartment: address.apartment || "",
      isNeighborhoodCustom,
      isStreetCustom,
    }));
    setIsPrefilled(true);
  }, [isPrefilled, profile]);

  // Viloyatlar
  const { data: regions = [] } = useQuery({
    queryKey: ["regions", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
  });

  // Tumanlar
  const { data: districts = [] } = useQuery({
    queryKey: ["regions", "district", form.region],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: form.region })
        .then((r) => r.data),
    enabled: !!form.region,
  });

  // Mahallalar
  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["regions", "neighborhood", form.district],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "neighborhood", parent: form.district })
        .then((r) => r.data),
    enabled: !!form.district && !form.isNeighborhoodCustom,
  });

  // Ko'chalar
  const { data: streets = [] } = useQuery({
    queryKey: ["regions", "street", form.neighborhood],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "street", parent: form.neighborhood })
        .then((r) => r.data),
    enabled: !!form.neighborhood && !form.isStreetCustom,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => usersAPI.setRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Hudud muvaffaqiyatli saqlandi!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Saqlashda xatolik yuz berdi",
      );
    },
  });

  const handleNext = () => {
    if (step === 1 && !form.region) return toast.error("Viloyatni tanlang");
    if (step === 2 && !form.district) return toast.error("Tumanni tanlang");
    if (step === 3 && !form.neighborhood && !form.isNeighborhoodCustom)
      return toast.error("Mahallani tanlang yoki nomini kiriting");
    if (
      step === 3 &&
      form.isNeighborhoodCustom &&
      !form.neighborhoodCustom.trim()
    )
      return toast.error("Mahalla nomini kiriting");
    if (step === 4 && !form.street && !form.isStreetCustom)
      return toast.error("Ko'chani tanlang yoki nomini kiriting");
    if (step === 4 && form.isStreetCustom && !form.streetCustom.trim())
      return toast.error("Ko'cha nomini kiriting");

    if (step < 5) {
      setStep(step + 1);
    } else {
      if (!form.houseNumber.trim()) return toast.error("Uy raqamini kiriting");

      saveMutation.mutate({
        region: form.region,
        district: form.district,
        neighborhood: form.isNeighborhoodCustom ? null : form.neighborhood,
        street: form.isStreetCustom ? null : form.street,
        neighborhoodCustom: form.isNeighborhoodCustom
          ? form.neighborhoodCustom
          : "",
        streetCustom: form.isStreetCustom ? form.streetCustom : "",
        houseType: form.houseType,
        houseNumber: form.houseNumber,
        apartment: form.apartment,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSelect = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Pastki qadamlarni tozalash
      if (field === "region") {
        updated.district = "";
        updated.neighborhood = "";
        updated.street = "";
        updated.isNeighborhoodCustom = false;
        updated.isStreetCustom = false;
        updated.neighborhoodCustom = "";
        updated.streetCustom = "";
      }
      if (field === "district") {
        updated.neighborhood = "";
        updated.street = "";
        updated.isNeighborhoodCustom = false;
        updated.isStreetCustom = false;
        updated.neighborhoodCustom = "";
        updated.streetCustom = "";
      }
      if (field === "neighborhood") {
        updated.street = "";
        updated.isStreetCustom = false;
        updated.streetCustom = "";
      }

      return updated;
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Viloyatni tanlang</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 p-1 custom-scrollbar">
              {regions.map((r) => (
                <button
                  key={r._id}
                  onClick={() => handleSelect("region", r._id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${
                    form.region === r._id
                      ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-medium">{r.name}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    form.region === r._id ? "border-blue-500 bg-blue-500" : "border-slate-300 group-hover:border-blue-400"
                  }`}>
                    {form.region === r._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Tuman / Shaharni tanlang
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 p-1 custom-scrollbar">
              {districts.map((d) => (
                <button
                  key={d._id}
                  onClick={() => handleSelect("district", d._id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${
                    form.district === d._id
                      ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-medium">{d.name}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    form.district === d._id ? "border-blue-500 bg-blue-500" : "border-slate-300 group-hover:border-blue-400"
                  }`}>
                    {form.district === d._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Mahallani tanlang</h2>
            {!form.isNeighborhoodCustom ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 p-1 mb-4 custom-scrollbar">
                  {neighborhoods.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleSelect("neighborhood", n._id)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${
                        form.neighborhood === n._id
                          ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-medium">{n.name}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        form.neighborhood === n._id ? "border-blue-500 bg-blue-500" : "border-slate-300 group-hover:border-blue-400"
                      }`}>
                        {form.neighborhood === n._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      isNeighborhoodCustom: true,
                      neighborhood: "",
                    }))
                  }
                  className="w-full text-left px-5 py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/30 font-medium transition-all"
                >
                  + Ro'yxatda yo'q — o'zim kiritaman
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                  <label className="block text-sm font-semibold text-slate-700">Mahalla nomi</label>
                  <input
                    type="text"
                    value={form.neighborhoodCustom}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        neighborhoodCustom: e.target.value,
                      }))
                    }
                    placeholder="Masalan: Navoiy"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      isNeighborhoodCustom: false,
                      neighborhoodCustom: "",
                    }))
                  }
                  className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Ro'yxatdan tanlashga qaytish
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Ko'chani tanlang</h2>
            {!form.isStreetCustom ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 p-1 mb-4 custom-scrollbar">
                  {streets.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelect("street", s._id)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${
                        form.street === s._id
                          ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-medium">{s.name}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        form.street === s._id ? "border-blue-500 bg-blue-500" : "border-slate-300 group-hover:border-blue-400"
                      }`}>
                        {form.street === s._id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      isStreetCustom: true,
                      street: "",
                    }))
                  }
                  className="w-full text-left px-5 py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/30 font-medium transition-all"
                >
                  + Ro'yxatda yo'q — o'zim kiritaman
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                  <label className="block text-sm font-semibold text-slate-700">Ko'cha nomi</label>
                  <input
                    type="text"
                    value={form.streetCustom}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, streetCustom: e.target.value }))
                    }
                    placeholder="Masalan: Mustaqillik"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      isStreetCustom: false,
                      streetCustom: "",
                    }))
                  }
                  className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Ro'yxatdan tanlashga qaytish
                </button>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Uy ma'lumotlarini kiriting
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Uy turi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {HOUSE_TYPES.map((ht) => (
                    <button
                      key={ht.id}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          houseType: ht.id,
                          apartment: "",
                        }))
                      }
                      className={`px-4 py-3.5 rounded-xl border font-medium transition-all ${
                        form.houseType === ht.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {ht.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                <label className="block text-sm font-semibold text-slate-700">
                  Uy raqami
                </label>
                <input
                  type="text"
                  value={form.houseNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, houseNumber: e.target.value }))
                  }
                  placeholder="Masalan: 42A"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900"
                />
              </div>

              {form.houseType === "apartment" && (
                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Xonadon raqami
                  </label>
                  <input
                    type="text"
                    value={form.apartment}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, apartment: e.target.value }))
                    }
                    placeholder="Masalan: 12"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900"
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-6">
            <MapPin className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Yashash joyingiz
          </h1>
          <p className="text-slate-500 text-lg">
            Xizmatlardan foydalanish uchun manzilingizni aniqlang
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 sm:p-10 transition-all">
          <StepBar currentStep={step} />

          <div className="min-h-[350px]">
            {renderStep()}
          </div>

          <div className="flex gap-4 mt-10 pt-6 border-t border-slate-100">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="py-3.5 px-6 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors focus:ring-4 focus:ring-slate-100"
              >
                Orqaga
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saveMutation.isPending}
              className="flex-1 relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold py-3.5 flex justify-center items-center gap-2 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {saveMutation.isPending
                  ? "Saqlanmoqda..."
                  : step === 5
                    ? "Saqlash va davom etish"
                    : "Keyingisi"}
                {step < 5 && !saveMutation.isPending && (
                  <ChevronRight className="w-5 h-5" />
                )}
              </span>
              {saveMutation.isPending && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionSetupPage;
