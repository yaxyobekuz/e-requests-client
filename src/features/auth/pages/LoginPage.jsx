import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authAPI } from "@/shared/api/http";
import PhoneInput from "@/shared/components/ui/PhoneInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      return toast.error("Telefon raqamni to'liq kiriting");
    }
    if (!form.password) {
      return toast.error("Parolni kiriting");
    }

    setLoading(true);
    try {
      const { data } = await authAPI.login({
        phone: `+${cleanPhone}`,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      toast.success("Muvaffaqiyatli kirdingiz!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Kirishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Kirish</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Hisobingizga kiring
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Telefon raqam
            </label>
            <PhoneInput
              value={form.phone}
              onChange={handleChange}
              name="phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parol</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Parolingizni kiriting"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Kirilyapti..." : "Kirish"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
