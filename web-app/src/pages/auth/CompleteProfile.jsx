import CompleteProfileForm from "../../components/auth/CompleteProfileForm";
import workerImage from "../../assets/workerImage.jpg";

const CompleteProfile = () => {
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
              Account Security
              <br />
              <span className="text-[#8B7CFF]">Create Your Password</span>
            </h1>
          </div>

          <p className="text-white/75 text-sm xl:text-base leading-7 max-w-lg mb-6">
            Set up your security credentials to access the FIELDcam portal and start managing assigned field projects.
          </p>

          <div className="flex flex-wrap gap-3 mb-9">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>◎</span>
              bcrypt Encryption
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>◈</span>
              Cross-Platform Login
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>♙</span>
              Project Dashboard Access
            </div>
          </div>

          <div className="flex items-start gap-10 xl:gap-14">
            <div>
              <p className="text-xl xl:text-2xl font-bold">Web & Mobile</p>
              <p className="text-xs text-white/60 mt-1">Single Identity Account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <CompleteProfileForm />
      </div>
    </div>
  );
};

export default CompleteProfile;
