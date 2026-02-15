// Toaster
import { toast } from "sonner";

// API
import { requestsAPI } from "@/shared/api/http";

// React
import { useEffect, useMemo, useRef } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Card from "@/shared/components/ui/Card";
import StepBars from "@/shared/components/ui/StepBars";
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { requestCategories } from "@/shared/data/request-categories";

// Router
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Tanstack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const EditRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);

  const stateRequest = location.state?.request || null;

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", "my"],
    queryFn: () => requestsAPI.getMyRequests().then((res) => res.data),
    enabled: !stateRequest,
  });

  const request = useMemo(() => {
    return stateRequest || requests.find((item) => item._id === id) || null;
  }, [stateRequest, requests, id]);

  const {
    step,
    setField,
    setFields,
    state: form,
  } = useObjectState({
    step: 1,
    description: "",
    contactPhone: "",
    contactLastName: "",
    contactFirstName: "",
  });

  useEffect(() => {
    if (!request || initializedRef.current) return;

    setFields({
      description: request.description || "",
      contactPhone: request.contactPhone || "",
      contactLastName: request.contactLastName || "",
      contactFirstName: request.contactFirstName || "",
    });

    initializedRef.current = true;
  }, [request, setFields]);

  const updateMutation = useMutation({
    mutationFn: (payload) => requestsAPI.update(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Ariza yangilandi!");
      navigate("/requests/my");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Yangilashda xatolik yuz berdi",
      );
    },
  });

  const categoryLabel = request
    ? requestCategories.find((c) => c.id === request.category)?.label ||
      request.category
    : "Murojaat";

  const canEdit = request?.status === "pending";

  const handleNext = () => {
    if (!request) return;

    if (step === 1) {
      if (!form.description.trim()) {
        return toast.error("Muammo tavsifini kiriting");
      }

      setField("step", 2);
      return;
    }

    if (!form.contactFirstName.trim())
      return toast.error("Ismingizni kiriting");
    if (!form.contactLastName.trim())
      return toast.error("Familiyangizni kiriting");
    if (!form.contactPhone.trim())
      return toast.error("Telefon raqamni kiriting");

    updateMutation.mutate({
      id: request._id,
      data: {
        description: form.description,
        contactFirstName: form.contactFirstName,
        contactLastName: form.contactLastName,
        contactPhone: form.contactPhone,
      },
    });
  };

  return (
    <div className="min-h-screen space-y-5 animate__animated animate__fadeIn">
      <BackHeader
        href="/requests/my"
        title={`Arizani tahrirlash - ${categoryLabel}`}
      />

      <div className="container space-y-5">
        {isLoading && !request && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {!isLoading && !request && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Ariza topilmadi</p>
            <button
              onClick={() => navigate("/requests/my")}
              className="text-blue-600 hover:underline text-sm"
            >
              Murojaatlarimga qaytish
            </button>
          </div>
        )}

        {request && (
          <>
            <StepBars
              totalSteps={2}
              currentStep={step}
              inactiveClassName="bg-gray-200"
            />

            {!canEdit && (
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm">
                Faqat "Kutilmoqda" holatidagi arizalarni tahrirlash mumkin.
              </div>
            )}

            <div key={step} className="animate__animated animate__fadeIn">
              {step === 1 ? (
                <Card title="Muammoingizni tavsiflang">
                  <Step1
                    disabled={!canEdit}
                    description={form.description}
                    onDescriptionChange={(value) =>
                      setField("description", value)
                    }
                  />
                </Card>
              ) : (
                <Card title="Aloqa ma'lumotlari">
                  <Step2
                    disabled={!canEdit}
                    contactFirstName={form.contactFirstName}
                    contactLastName={form.contactLastName}
                    contactPhone={form.contactPhone}
                    onContactFirstNameChange={(value) =>
                      setField("contactFirstName", value)
                    }
                    onContactLastNameChange={(value) =>
                      setField("contactLastName", value)
                    }
                    onContactPhoneChange={(value) =>
                      setField("contactPhone", value)
                    }
                  />
                </Card>
              )}

              <div className="flex items-center gap-3 mt-6">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setField("step", 1)}
                    className="w-full bg-gray-200 py-2.5 rounded-lg font-medium"
                  >
                    Ortga
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canEdit || updateMutation.isPending}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {step === 1 ? "Keyingi" : "Saqlash"}
                  {updateMutation.isPending && "..."}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Step1 = ({ description, onDescriptionChange, disabled }) => (
  <textarea
    rows={12}
    value={description}
    disabled={disabled}
    onChange={(e) => onDescriptionChange(e.target.value)}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
  />
);

const Step2 = ({
  contactPhone,
  contactLastName,
  contactFirstName,
  onContactPhoneChange,
  onContactFirstNameChange,
  onContactLastNameChange,
  disabled,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Ism</label>
        <input
          type="text"
          value={contactFirstName}
          disabled={disabled}
          onChange={(e) => onContactFirstNameChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Familiya</label>
        <input
          type="text"
          value={contactLastName}
          disabled={disabled}
          onChange={(e) => onContactLastNameChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Telefon raqam</label>
        <input
          type="text"
          value={contactPhone}
          disabled={disabled}
          onChange={(e) => onContactPhoneChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default EditRequestPage;
