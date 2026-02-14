import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestsAPI } from "@/shared/api/http";
import { requestCategories } from "@/shared/data/request-categories";
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";
import { ArrowLeft, Pencil, X } from "lucide-react";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", "my"],
    queryFn: () => requestsAPI.getMyRequests().then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => requestsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests", "my"] });
      toast.success("Ariza yangilandi!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Yangilashda xatolik yuz berdi",
      );
    },
  });

  const openEditModal = (request) => {
    dispatch(open({ modal: "editRequest", data: request }));
  };

  const getCategoryLabel = (id) =>
    requestCategories.find((c) => c.id === id)?.label || id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/requests")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Mening arizalarim</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Hozircha arizalar yo'q</p>
            <button
              onClick={() => navigate("/requests")}
              className="text-blue-600 hover:underline text-sm"
            >
              Yangi ariza yuborish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const status = REQUEST_STATUSES[req.status] || {};
              return (
                <div
                  key={req._id}
                  className="bg-white rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        {getCategoryLabel(req.category)}
                      </span>
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    {req.status === "pending" && (
                      <button
                        onClick={() => openEditModal(req)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm mb-2 line-clamp-2">
                    {req.description}
                  </p>

                  {req.status === "rejected" && req.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-700">
                      <span className="font-medium">Rad etish sababi: </span>
                      {req.rejectionReason}
                    </div>
                  )}

                  {req.closingNote && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                      <span className="font-medium">Izoh: </span>
                      {req.closingNote}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(req.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ModalWrapper name="editRequest" title="Arizani tahrirlash">
        <EditRequestForm mutation={updateMutation} />
      </ModalWrapper>
    </div>
  );
};

const EditRequestForm = ({ _id, description, category, contactFirstName, contactLastName, contactPhone, close, isLoading, setIsLoading }) => {
  const [form, setForm] = useState({
    description: description || "",
    category: category || "",
    contactFirstName: contactFirstName || "",
    contactLastName: contactLastName || "",
    contactPhone: contactPhone || "",
  });

  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestsAPI.update(_id, form);
      queryClient.invalidateQueries({ queryKey: ["requests", "my"] });
      toast.success("Ariza yangilandi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Bo'lim</label>
        <select
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {requestCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tavsif</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          rows={4}
          className="w-full px-3 py-2 border rounded-lg resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ism</label>
          <input
            type="text"
            value={form.contactFirstName}
            onChange={(e) =>
              setForm((p) => ({ ...p, contactFirstName: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Familiya</label>
          <input
            type="text"
            value={form.contactLastName}
            onChange={(e) =>
              setForm((p) => ({ ...p, contactLastName: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Telefon</label>
        <input
          type="text"
          value={form.contactPhone}
          onChange={(e) =>
            setForm((p) => ({ ...p, contactPhone: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
};

export default MyRequestsPage;
