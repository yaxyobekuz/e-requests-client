import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import useObjectState from "@/shared/hooks/useObjectState";
import { AUTH_STEPS } from "../auth.data";
import PhoneStep from "../components/steps/PhoneStep";
import LoginStep from "../components/steps/LoginStep";
import LoginOtpStep from "../components/steps/LoginOtpStep";
import RegisterNameStep from "../components/steps/RegisterNameStep";
import RegisterOtpStep from "../components/steps/RegisterOtpStep";
import RegisterPassStep from "../components/steps/RegisterPassStep";
import bgImage from "../assets/backgrounds/meeting.avif";

const STEP_META = {
  [AUTH_STEPS.PHONE]: {
    title: "Xush kelibsiz! 👋",
    subtitle: "Davom etish uchun telefon raqamingizni kiriting",
  },
  [AUTH_STEPS.LOGIN]: {
    title: "Tizimga kirish",
    subtitle: "Parolni kiriting yoki Telegram orqali kiring",
  },
  [AUTH_STEPS.LOGIN_OTP]: {
    title: "Telegram kodi bilan kirish",
    subtitle: "Telegram botidan olgan 5 xonali kodni kiriting",
  },
  [AUTH_STEPS.REGISTER_NAME]: {
    title: "Ismingizni kiriting",
    subtitle: "Tizimda siz uchun yangi hisob yaratiladi",
  },
  [AUTH_STEPS.REGISTER_OTP]: {
    title: "Telegram kodi",
    subtitle: "Telegram botidan olgan 5 xonali kodni kiriting",
  },
  [AUTH_STEPS.REGISTER_PASS]: {
    title: "Parol o'rnating",
    subtitle: "Hisobingiz uchun xavfsiz parol tanlang",
  },
};

const BACK_MAP = {
  [AUTH_STEPS.LOGIN]: AUTH_STEPS.PHONE,
  [AUTH_STEPS.LOGIN_OTP]: AUTH_STEPS.LOGIN,
  [AUTH_STEPS.REGISTER_NAME]: AUTH_STEPS.PHONE,
  [AUTH_STEPS.REGISTER_OTP]: AUTH_STEPS.REGISTER_NAME,
  [AUTH_STEPS.REGISTER_PASS]: AUTH_STEPS.REGISTER_OTP,
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { phone, password, firstName, otp, setField, setFields } =
    useObjectState({
      phone: "",
      password: "",
      firstName: "",
      otp: "",
    });

  const step = searchParams.get("step") || AUTH_STEPS.PHONE;

  const goToStep = (s, replace = false) =>
    setSearchParams({ step: s }, { replace });

  useEffect(() => {
    if (!STEP_META[step]) goToStep(AUTH_STEPS.PHONE, true);
  }, [step]);

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleBack = () => {
    const backStep = BACK_MAP[step];
    if (backStep) {
      setFields({ otp: "", password: "" });
      goToStep(backStep);
    }
  };

  const handleAuthSuccess = ({ token }) => {
    localStorage.setItem("token", token);
    navigate("/dashboard");
  };

  const meta = STEP_META[step] || STEP_META[AUTH_STEPS.PHONE];
  const hasBack = !!BACK_MAP[step];

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Left side: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center sm:p-12 relative z-10">
        <div className="w-full max-w-md p-5 sm:bg-transparent border border-slate-100 sm:border-none sm:p-0">
          {hasBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </button>
          )}

          <div className="text-center sm:text-left mb-8">
            <div className="lg:hidden w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-4 shadow-sm">
              <UserCircle2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {meta.title}
            </h2>
            <p className="text-slate-500">{meta.subtitle}</p>
          </div>

          {step === AUTH_STEPS.PHONE && (
            <PhoneStep
              phone={phone}
              onChange={handleChange}
              onPhoneExists={() => goToStep(AUTH_STEPS.LOGIN)}
              onPhoneNew={() => goToStep(AUTH_STEPS.REGISTER_NAME)}
            />
          )}

          {step === AUTH_STEPS.LOGIN && (
            <LoginStep
              phone={phone}
              password={password}
              onChange={handleChange}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              onSuccess={handleAuthSuccess}
              onTelegramClick={() => goToStep(AUTH_STEPS.LOGIN_OTP)}
            />
          )}

          {step === AUTH_STEPS.LOGIN_OTP && (
            <LoginOtpStep
              phone={phone}
              otp={otp}
              onChange={handleChange}
              onSuccess={handleAuthSuccess}
            />
          )}

          {step === AUTH_STEPS.REGISTER_NAME && (
            <RegisterNameStep
              firstName={firstName}
              onChange={handleChange}
              onSuccess={() => goToStep(AUTH_STEPS.REGISTER_OTP)}
            />
          )}

          {step === AUTH_STEPS.REGISTER_OTP && (
            <RegisterOtpStep
              otp={otp}
              onChange={handleChange}
              onSuccess={() => goToStep(AUTH_STEPS.REGISTER_PASS)}
            />
          )}

          {step === AUTH_STEPS.REGISTER_PASS && (
            <RegisterPassStep
              phone={phone}
              otp={otp}
              firstName={firstName}
              password={password}
              onChange={handleChange}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>

      {/* Right side: branding */}
      <img src={bgImage} className="hidden w-1/2 object-cover lg:block" />
    </div>
  );
};

export default AuthPage;
