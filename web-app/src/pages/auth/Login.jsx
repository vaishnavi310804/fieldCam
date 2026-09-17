import LoginForm from "../../components/auth/LoginForm";
import workerImage from "../../assets/workerImage.jpg"

const Login = () => {
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
          {/* Headline */}
          <div className="mb-5">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Capture. Document.
              <br />
              <span className="text-[#8B7CFF]">Deliver.</span>
            </h1>
          </div>

          <p className="text-white/75 text-sm xl:text-base leading-7 max-w-lg mb-6">
            Empower your field teams with intelligent photo documentation.
            Streamline property inspections with geo-tagged imagery and
            real-time reporting.
          </p>

          <div className="flex flex-wrap gap-3 mb-9">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>◎</span>
              Geo-Tagged Photos
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>◈</span>
              Secure Cloud Storage
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs xl:text-sm">
              <span>♙</span>
              Team Management
            </div>
          </div>

          {/* Statistics */}
          <div className="flex items-start gap-10 xl:gap-14">
            <div>
              <p className="text-xl xl:text-2xl font-bold">12K+</p>
              <p className="text-xs text-white/60 mt-1">
                Properties Documented
              </p>
            </div>

            <div>
              <p className="text-xl xl:text-2xl font-bold">850+</p>
              <p className="text-xs text-white/60 mt-1">
                Active Field Workers
              </p>
            </div>

            <div>
              <p className="text-xl xl:text-2xl font-bold">99.9%</p>
              <p className="text-xs text-white/60 mt-1">
                Platform Uptime
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;