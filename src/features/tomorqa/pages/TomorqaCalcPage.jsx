import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Info,
  Boxes,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from "lucide-react";

import Card from "@/shared/components/ui/Card";
import { authAPI } from "@/shared/api";
import { tomorqaAPI } from "@/features/tomorqa/api";
import useObjectState from "@/shared/hooks/useObjectState";
import { sleep } from "@/shared/utils/sleep";
import { SELECT_CLS } from "@/features/tomorqa/data/tomorqa.styles";
import Lottie from "lottie-react";
import { aiAnimation } from "@/shared/assets/animations";
import BackgroundPatterns from "../components/BackgroundPatterns";
import Counter from "@/shared/components/ui/Counter";

const ResultCard = ({ result, productName, varietyName }) => {
  if (!result) return null;
  return (
    <Card className="space-y-4" title={`${productName} - ${varietyName}`}>
      <ul className="grid grid-cols-2 gap-4 xs:grid-cols-3">
        {/* 1 */}
        <li className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800">
            <Boxes className="size-5 text-blue-500" strokeWidth={1.5} />
            <Counter value={result?.avgPerSotix} /> kg
          </div>

          <p className="text-xs text-gray-600 mt-0.5">1 Sotixdan o'rtacha</p>
        </li>

        {/* 2 */}
        <li className="bg-pink-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800">
            <ArrowDownNarrowWide
              strokeWidth={1.5}
              className="size-5 text-pink-400"
            />
            <Counter value={result?.minPerSotix} /> kg
          </div>

          <p className="text-xs text-gray-600 mt-0.5">1 Sotixdan kamida</p>
        </li>

        {/* 3 */}
        <li className="col-span-2 bg-orange-50 rounded-xl p-3 text-center xs:col-span-1">
          <div className="flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800">
            <ArrowUpNarrowWide
              strokeWidth={1.5}
              className="size-5 text-orange-400"
            />
            <Counter value={result?.maxPerSotix} /> kg
          </div>

          <p className="text-xs text-gray-600 mt-0.5">1 Sotixdan ko'pida</p>
        </li>
      </ul>

      <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 text-sm col-span-3">
        <Info
          strokeWidth={1.5}
          className="flex-shrink-0 size-5 stroke-primary"
        />
        <p>
          Sizning hududingizdagi {productName} ({varietyName}) navidan 1 sotix
          yerda o'rtacha <strong>{result?.avgPerSotix} kg</strong> hosil olish
          mumkin.
        </p>
      </div>
    </Card>
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
      <Card title="Ma'lumotlarni kiriting" className="space-y-3">
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
