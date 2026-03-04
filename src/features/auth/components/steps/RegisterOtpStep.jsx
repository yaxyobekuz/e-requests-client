import { toast } from "sonner";
import OtpHintBlock from "../OtpHintBlock";
import OtpField from "../OtpField";
import SubmitButton from "../SubmitButton";

/**
 * Ro'yxatdan o'tish — OTP tasdiqlash qadami.
 * Tasdiqlanganda onSuccess() chaqiriladi.
 * @param {{otp: string, onChange: function, onSuccess: function}} props
 */
const RegisterOtpStep = ({ otp, onChange, onSuccess }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 5) return toast.error("5 xonali kodni to'liq kiriting");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OtpHintBlock />
      <OtpField value={otp} onChange={onChange} />
      <SubmitButton loading={false} label="Davom etish" loadingLabel="" />
    </form>
  );
};

export default RegisterOtpStep;
