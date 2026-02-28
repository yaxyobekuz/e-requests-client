import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Phone, UserCircle2 } from "lucide-react";
import { authAPI } from "@/shared/api/http";
import PhoneInput from "@/shared/components/ui/PhoneInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Left side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-none sm:bg-transparent border border-slate-100 sm:border-none p-8 sm:p-0">
          <div className="text-center sm:text-left mb-10">
            <div className="lg:hidden w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-4 shadow-sm">
              <UserCircle2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Xush kelibsiz! 👋
            </h2>
            <p className="text-slate-500">Shaxsiy kabinetingizga kiring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
              <label className="block text-sm font-semibold text-slate-700">
                Telefon raqam
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <PhoneInput
                  value={form.phone}
                  onChange={handleChange}
                  name="phone"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium tracking-wide"
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
              <label className="block text-sm font-semibold text-slate-700">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Parolingizni kiriting"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold py-3.5 flex justify-center items-center gap-2 focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative">
                {loading ? "Kirish jarayoni..." : "Tizimga kirish"}
              </span>
              {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative"></div>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Hisobingiz yo'qmi?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: branding/illustration */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between overflow-hidden relative bg-slate-900">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-0"></div>

        <div className="relative z-10 px-12 mt-12 flex w-full pb-0">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <UserCircle2 className="text-white w-5 h-5" />
            </div>
            <span className="font-semibold text-white tracking-wide uppercase text-sm">
              Fuqarolar Portali
            </span>
          </div>
        </div>

        <div className="relative z-10 px-12">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Murojaatlaringiz endi <br />
            <span className="text-blue-400">yanada oson.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md">
            Davlat xizmatlari va masalalaringizni uydan chiqmasdan hal qiling.
            Biz bilan hammasi tez va shaffof.
          </p>

          <div className="mt-12 flex gap-4 w-full">
            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1 hover:bg-white/15 transition-colors">
              <h3 className="font-bold text-white text-xl mb-1">Tezkor</h3>
              <p className="text-sm text-slate-400">Onlayn tarzda murojaat</p>
            </div>
            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 flex-1 hover:bg-white/15 transition-colors">
              <h3 className="font-bold text-white text-xl mb-1">Shaffof</h3>
              <p className="text-sm text-slate-400">Kuzatish imkoniyati</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-12 text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} e-Murojaat. Barcha huquqlar
          himoyalangan.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
