import { useState } from "react";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Sprout } from "lucide-react";

import Card from "@/shared/components/ui/Card";
import { tomorqaAPI } from "@/features/tomorqa/api";
import useObjectState from "@/shared/hooks/useObjectState";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  SEASON_OPTIONS,
  YEAR_OPTIONS,
} from "@/features/tomorqa/data/tomorqa.data";
import { SELECT_CLS, INPUT_CLS } from "@/features/tomorqa/data/tomorqa.styles";

const TomorqaEnterPage = () => {
  const { products } = useOutletContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const {
    state: form,
    setField,
    setFields,
  } = useObjectState({
    productId: "",
    varietyId: "",
    area: "",
    amount: "",
    year: String(new Date().getFullYear()),
    season: "",
  });

  const selectedProduct = products.find((product) => product._id === form.productId);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["harvest", "my", page],
    queryFn: () =>
      tomorqaAPI.getMyHarvest({ page, limit: 10 }).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => tomorqaAPI.createHarvest(data),
    onSuccess: () => {
      toast.success("Hosil ma'lumoti muvaffaqiyatli saqlandi!");
      setFields({
        productId: "",
        varietyId: "",
        area: "",
        amount: "",
        season: "",
      });
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["harvest", "my"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
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
    if (!form.productId) {
      return toast.error("Mahsulotni tanlang");
    }

    if (!form.varietyId) {
      return toast.error("Navni tanlang");
    }

    if (!form.area || Number(form.area) <= 0) {
      return toast.error("Yer maydonini kiriting");
    }

    if (!form.amount || Number(form.amount) < 0) {
      return toast.error("Hosil miqdorini kiriting");
    }

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
      <Card title="Yangi hosil kiriting">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Mahsulot <span className="text-red-500">*</span>
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
              Nav <span className="text-red-500">*</span>
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
                onChange={(event) => setField("area", event.target.value)}
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
                onChange={(event) => setField("amount", event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Yil
              </label>
              <select
                className={SELECT_CLS}
                value={form.year}
                onChange={(event) => setField("year", event.target.value)}
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Mavsum
              </label>
              <select
                className={SELECT_CLS}
                value={form.season}
                onChange={(event) => setField("season", event.target.value)}
              >
                {SEASON_OPTIONS.map((season) => (
                  <option key={season.value} value={season.value}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </Card>

      <Card title="Hosil tarixi">
        {historyLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 bg-gray-100 rounded-xl animate-pulse"
              />
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
            {history.map((harvest) => (
              <div
                key={harvest._id}
                className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0 size-9 rounded-lg bg-gradient-to-br from-lime-400 to-blue-700 flex items-center justify-center">
                    <Sprout className="size-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {harvest.product?.name} - {harvest.varietyName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                      <span>{harvest.area} sotix</span>
                      <span>·</span>
                      <span>{harvest.amount} kg</span>
                      <span>·</span>
                      <span>{harvest.year}</span>
                      {harvest.season && (
                        <>
                          <span>·</span>
                          <span>{harvest.season}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatUzDate(harvest.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(harvest._id)}
                  disabled={deleteMutation.isPending}
                  className="flex-shrink-0 size-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="O'chirish"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border disabled:opacity-40"
                >
                  Oldingi
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((currentPage) => Math.min(totalPages, currentPage + 1))
                  }
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

export default TomorqaEnterPage;
