// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

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
  <div className="flex items-center justify-center gap-2 mb-8">
    {STEPS.map((step) => (
      <div key={step.id} className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step.id <= currentStep
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {step.id}
        </div>
        {step.id < STEPS.length && (
          <div
            className={`w-8 h-0.5 ${step.id < currentStep ? "bg-blue-600" : "bg-gray-200"}`}
          />
        )}
      </div>
    ))}
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
          <div>
            <h2 className="text-lg font-semibold mb-4">Viloyatni tanlang</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {regions.map((r) => (
                <button
                  key={r._id}
                  onClick={() => handleSelect("region", r._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    form.region === r._id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Tuman/Shaharni tanlang
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {districts.map((d) => (
                <button
                  key={d._id}
                  onClick={() => handleSelect("district", d._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    form.district === d._id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">Mahallani tanlang</h2>
            {!form.isNeighborhoodCustom ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                  {neighborhoods.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleSelect("neighborhood", n._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        form.neighborhood === n._id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {n.name}
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
                  className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
                >
                  Ro'yxatda yo'q — o'zim kiritaman
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={form.neighborhoodCustom}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      neighborhoodCustom: e.target.value,
                    }))
                  }
                  placeholder="Mahalla nomini kiriting"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      isNeighborhoodCustom: false,
                      neighborhoodCustom: "",
                    }))
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ro'yxatdan tanlash
                </button>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">Ko'chani tanlang</h2>
            {!form.isStreetCustom ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                  {streets.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelect("street", s._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        form.street === s._id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s.name}
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
                  className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
                >
                  Ro'yxatda yo'q — o'zim kiritaman
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={form.streetCustom}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, streetCustom: e.target.value }))
                  }
                  placeholder="Ko'cha nomini kiriting"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      isStreetCustom: false,
                      streetCustom: "",
                    }))
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ro'yxatdan tanlash
                </button>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Uy ma'lumotlarini kiriting
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
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
                      className={`px-4 py-3 rounded-lg border text-sm transition-colors ${
                        form.houseType === ht.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {ht.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Uy raqami
                </label>
                <input
                  type="text"
                  value={form.houseNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, houseNumber: e.target.value }))
                  }
                  placeholder="Uy raqamini kiriting"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {form.houseType === "apartment" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Xonadon raqami
                  </label>
                  <input
                    type="text"
                    value={form.apartment}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, apartment: e.target.value }))
                    }
                    placeholder="Xonadon raqamini kiriting"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-center mb-2">
          Yashash joyingizni belgilang
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Xizmatlardan foydalanish uchun hududingizni kiriting
        </p>

        <StepBar currentStep={step} />

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          {renderStep()}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Orqaga
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saveMutation.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saveMutation.isPending
                ? "Saqlanmoqda..."
                : step === 5
                  ? "Saqlash"
                  : "Keyingi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionSetupPage;
