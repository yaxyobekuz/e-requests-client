import { useState } from "react";
import { toast } from "sonner";
import { authAPI } from "@/shared/api/http";
import PasswordField from "../PasswordField";
import SubmitButton from "../SubmitButton";

/**
 * Ro'yxatdan o'tish — parol o'rnatish va yakuniy ro'yxatdan o'tish qadami.
 * Muvaffaqiyatli ro'yxatdan o'tishda onSuccess({ token, user }) chaqiriladi.
 * @param {{phone: string, otp: string, firstName: string, password: string, onChange: function, show: boolean, onToggle: function, onSuccess: function}} props
 */
const RegisterPassStep = ({
  phone,
  otp,
  firstName,
  password,
  onChange,
  show,
  onToggle,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      return toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
    }
    setLoading(true);
    try {
      const { data } = await authAPI.registerWithOtp({
        phone: `+${phone.replace(/\D/g, "")}`,
        code: otp,
        firstName: firstName.trim(),
        password,
      });
      onSuccess(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PasswordField
        value={password}
        onChange={onChange}
        show={show}
        onToggle={onToggle}
        placeholder="Kamida 6 ta belgi"
      />
      <SubmitButton
        loading={loading}
        label="Ro'yxatdan o'tish"
        loadingLabel="Saqlanmoqda..."
      />
    </form>
  );
};

export default RegisterPassStep;
