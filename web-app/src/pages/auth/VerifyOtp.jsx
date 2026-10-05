import VerifyOtpForm from "../../components/auth/VerifyOtpForm";
import workerImage from "../../assets/workerImage.jpg";

const VerifyOtp = () => {
  return (
    <div className="min-h-screen bg-[#F8F7FF] flex">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src={workerImage}
          alt="Field worker"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-end w-full px-14 pb-14 text-white">
          <div className="mb-5">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Account Onboarding
              <br />
              <span className="text-[#8B7CFF]">Account Verification</span>
            </h1>
          </div>

          <p className="text-white/75 text-sm xl:text-base leading-7 max-w-lg mb-6">
            Verify your email address using the One-Time Password sent to your inbox to complete your account registration.
          </p>

          <div className="flex flex-wrap gap-3 mb-9">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>◎</span>
              Email Verification
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>◈</span>
              Secure OTP Security
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>♙</span>
              Platform Access
            </div>
          </div>

          <div className="flex items-start gap-10 xl:gap-14">
            <div>
              <p className="text-xl xl:text-2xl font-bold">100%</p>
              <p className="text-xs text-white/60 mt-1">Verified Partners</p>
            </div>

            <div>
              <p className="text-xl xl:text-2xl font-bold">256-bit</p>
              <p className="text-xs text-white/60 mt-1">Encrypted Sessions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <VerifyOtpForm />
      </div>
    </div>
  );
};

export default VerifyOtp;
