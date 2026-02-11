import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authAPI } from "@/shared/api/http";
import PhoneInput from "@/shared/components/ui/PhoneInput";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim()) {
      return toast.error("Ismingizni kiriting");
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 12) {
      return toast.error("Telefon raqamni to'liq kiriting");
    }
    if (!form.password || form.password.length < 6) {
      return toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
    }

    setLoading(true);
    try {
      const { data } = await authAPI.register({
        firstName: form.firstName.trim(),
        phone: `+${cleanPhone}`,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Ro'yxatdan o'tishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">
          Ro'yxatdan o'tish
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Yangi hisob yarating
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ism</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Ismingizni kiriting"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              placeholder="Kamida 6 ta belgi"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Ro'yxatdan o'tilyapti..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          Hisobingiz bormi?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
