import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Forgot Password</h2>
        <p className="text-slate-600 mb-6">
          Password reset flow will be implemented next.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-[#6C63FF] hover:bg-[#5B54E8] text-white px-6 py-2 rounded-xl font-medium"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
