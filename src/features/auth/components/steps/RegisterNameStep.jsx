import { toast } from "sonner";
import { User } from "lucide-react";
import SubmitButton from "../SubmitButton";

/**
 * Ro'yxatdan o'tish — ism kiritish qadami.
 * Tasdiqlanganda onSuccess() chaqiriladi.
 * @param {{firstName: string, onChange: function, onSuccess: function}} props
 */
const RegisterNameStep = ({ firstName, onChange, onSuccess }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim()) return toast.error("Ismingizni kiriting");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
        <label className="block text-sm font-semibold text-slate-700">Ism</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-5 h-5" />
          </div>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={onChange}
            placeholder="Ismingizni kiriting"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
          />
        </div>
      </div>
      <SubmitButton loading={false} label="Davom etish" loadingLabel="" />
    </form>
  );
};

export default RegisterNameStep;
