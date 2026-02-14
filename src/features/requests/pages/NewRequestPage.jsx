// Toast
import { toast } from "sonner";

// API
import { authAPI, requestsAPI } from "@/shared/api/http";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Tanstack Query
import { useQuery, useMutation } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import StepBars from "@/shared/components/ui/StepBars";
import BackHeader from "@/shared/components/layout/BackHeader";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Data
import { requestCategories } from "@/shared/data/request-categories";

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "infrastructure";
  const category = requestCategories.find((c) => c.id === categoryId);

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const {
    step,
    setField,
    state: form,
  } = useObjectState({
    step: 1,
    description: "",
    contactPhone: user?.phone || "",
    contactLastName: user?.lastName || "",
    contactFirstName: user?.firstName || "",
  });

  const submitMutation = useMutation({
    mutationFn: (data) => requestsAPI.create(data),
    onSuccess: () => {
      toast.success("Murojaat muvaffaqiyatli yuborildi!");
      navigate("/requests/my");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Yuborishda xatolik yuz berdi",
      );
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.description.trim()) {
        return toast.error("Muammo tavsifini kiriting");
      }

      setField("step", 2);
    } else {
      if (!form.contactFirstName.trim())
        return toast.error("Ismingizni kiriting");
      if (!form.contactLastName.trim())
        return toast.error("Familiyangizni kiriting");
      if (!form.contactPhone.trim())
        return toast.error("Telefon raqamni kiriting");

      submitMutation.mutate({ category: categoryId, ...form });
    }
  };

  return (
    <div className="min-h-screen space-y-5 animate__animated animate__fadeIn">
      {/* Header */}
      <BackHeader
        href="/requests"
        title={"Yangi ariza - " + (category?.label || "Murojaat")}
      />

      <div className="container space-y-5">
        {/* Step indicator */}
        <StepBars
          totalSteps={2}
          currentStep={step}
          inactiveClassName="bg-gray-200"
        />

        <div key={step} className="animate__animated animate__fadeIn">
          {step === 1 ? (
            <Card title="Muammoingizni tavsiflang">
              <Step1
                description={form.description}
                onDescriptionChange={(value) => setField("description", value)}
              />
            </Card>
          ) : (
            <Card title="Aloqa ma'lumotlari">
              <Step2
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
            {/* Back Button */}
            {step === 2 && (
              <button
                type="button"
                onClick={() => setField("step", 1)}
                className="w-full bg-gray-200 py-2.5 rounded-lg font-medium"
              >
                Ortga
              </button>
            )}

            {/* Submit Button */}
            <button
              onClick={handleNext}
              disabled={submitMutation.isPending}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {step === 1 ? "Keyingi" : "Yuborish"}
              {submitMutation.isPending && "..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step1 = ({ description, onDescriptionChange }) => (
  <textarea
    rows={12}
    value={description}
    onChange={(e) => onDescriptionChange(e.target.value)}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
  />
);

const Step2 = ({
  contactPhone,
  contactLastName,
  contactFirstName,
  onContactPhoneChange,
  onContactFirstNameChange,
  onContactLastNameChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Ism</label>
        <input
          type="text"
          value={contactFirstName}
          onChange={(e) => onContactFirstNameChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Familiya</label>
        <input
          type="text"
          value={contactLastName}
          onChange={(e) => onContactLastNameChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Telefon raqam</label>
        <input
          type="text"
          value={contactPhone}
          onChange={(e) => onContactPhoneChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default NewRequestPage;
