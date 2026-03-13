import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, BarChart2, Info } from "lucide-react";

import Card from "@/shared/components/ui/Card";
import { authAPI } from "@/shared/api";
import { tomorqaAPI } from "@/features/tomorqa/api";
import useObjectState from "@/shared/hooks/useObjectState";
import useCountUp from "@/features/tomorqa/hooks/useCountUp";
import { sleep } from "@/shared/utils/sleep";
import { SELECT_CLS } from "@/features/tomorqa/data/tomorqa.styles";
import Lottie from "lottie-react";
import { aiAnimation } from "@/shared/assets/animations";
import BackgroundPatterns from "../components/BackgroundPatterns";

const ResultCard = ({ result, productName, varietyName }) => {
  const [visible, setVisible] = useState(false);
  const avg = useCountUp(result?.avgPerSotix, visible);
  const min = useCountUp(result?.minPerSotix, visible);
  const max = useCountUp(result?.maxPerSotix, visible);

  useEffect(() => {
    if (!result) {
      return;
    }

    setVisible(false);
    const timeoutId = setTimeout(() => setVisible(true), 80);

    return () => clearTimeout(timeoutId);
  }, [result]);

  if (!result) {
    return null;
  }

  return (
    <div
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-blue-500" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">
              {productName} - {varietyName}
            </p>
            <p className="text-xs text-blue-500">
              {result.count} ta ma'lumot asosida hisoblandi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <TrendingUp className="size-4 text-blue-500 mx-auto mb-1" />
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

        <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
          <Info className="size-3.5 mt-0.5 flex-shrink-0" />
          <p>
            Sizning hududingizdagi {productName} ({varietyName}) navidan 1 sotix
            yerda o'rtacha <strong>{avg} kg</strong> hosil olish mumkin.
          </p>
        </div>
      </div>
    </div>
  );
};

const TomorqaCalcPage = () => {
  const { products } = useOutletContext();
  const {
    state: form,
    setField,
    setFields,
  } = useObjectState({
    productId: "",
    varietyId: "",
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const selectedProduct = products.find(
    (product) => product._id === form.productId,
  );
  const regionId = user?.address?.region;

  const {
    data: calcData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["harvest", "calc", form.productId, form.varietyId, regionId],
    queryFn: async () => {
      await sleep(2000);

      return tomorqaAPI
        .getCalculation({
          productId: form.productId,
          varietyId: form.varietyId,
          regionId: regionId || undefined,
        })
        .then((res) => res.data);
    },
    retry: false,
    enabled: false,
  });

  const handleCalc = () => {
    if (!form.productId) {
      return toast.error("Mahsulotni tanlang");
    }

    if (!form.varietyId) {
      return toast.error("Navni tanlang");
    }

    setHasSearched(true);
    refetch();
  };

  const result =
    calcData?.find(
      (item) => String(item.varietyId) === String(form.varietyId),
    ) || null;

  return (
    <div className="space-y-5">
      <Card title="Hosil kalkulatsiyasi">
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Mahsulot va navini tanlang. Tizim sizning hududingiz bo'yicha
            yig'ilgan ma'lumotlar asosida taxminiy hosil miqdorini hisoblaydi.
          </p>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Mahsulot
            </label>
            <select
              className={SELECT_CLS}
              value={form.productId}
              onChange={(event) =>
                setFields({ productId: event.target.value, varietyId: "" })
              }
            >
              <option value="">- Mahsulotni tanlang -</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nav
            </label>
            <select
              className={SELECT_CLS}
              value={form.varietyId}
              onChange={(event) => setField("varietyId", event.target.value)}
              disabled={!selectedProduct}
            >
              <option value="">- Navni tanlang -</option>
              {(selectedProduct?.varieties || []).map((variety) => (
                <option key={variety._id} value={variety._id}>
                  {variety.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCalc}
            disabled={isFetching}
            className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Brain className="size-4" />
            {isFetching ? "Hisoblanyapti..." : "Hisoblash"}
          </button>
        </div>
      </Card>

      {isFetching && <AnimatedOverlay />}

      {!isFetching && hasSearched && !result && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-500">
          Hududingiz bo'yicha bu mahsulot va nav uchun ma'lumot topilmadi.
          <br />
          Boshqa fuqarolar ham hosil ma'lumotlari kiritishi bilan natija
          ko'rinadi.
        </div>
      )}

      {!isFetching && result && (
        <ResultCard
          result={result}
          productName={selectedProduct?.name}
          varietyName={
            selectedProduct?.varieties?.find(
              (variety) => variety._id === form.varietyId,
            )?.name
          }
        />
      )}
    </div>
  );
};

const AnimatedOverlay = () => {
  const lottieRef = useRef(null);

  useEffect(() => {
    lottieRef.current?.setSpeed(1.6);
  }, []);

  return (
    <div className="fixed inset-0 size-full z-10 !m-0">
      <div className="flex flex-col items-center justify-center gap-1.5 relative inset-0 size-full bg-white">
        <Lottie
          lottieRef={lottieRef}
          animationData={aiAnimation}
          className="size-32 xs:size-40"
        />

        <span className="text-sm text-gray-400">
          Ma'lumotlar hisoblanmoqda...
        </span>
      </div>

      <BackgroundPatterns />
    </div>
  );
};

export default TomorqaCalcPage;
