import { useAuth } from "../../context/AuthContext";
import { FiUser, FiLogOut, FiShield } from "react-icons/fi";
import fieldCamLogo from "../../assets/fieldCamLogo.png";

const StaffDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E2DE] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={fieldCamLogo} alt="FieldCam" className="h-7 w-auto" />
          <span className="text-xs font-semibold text-[#8B7CFF] bg-[#8B7CFF]/10 px-2.5 py-0.5 rounded-full">
            Staff Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[#3E3734]">
            <div className="w-7 h-7 rounded-full bg-[#5141F5]/10 text-[#5141F5] flex items-center justify-center font-bold">
              <FiUser size={14} />
            </div>
            <span className="font-semibold">{user?.name || "Staff Member"}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6763] hover:text-[#C62828] transition-colors"
          >
            <FiLogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="bg-white border border-[#E8E2DE] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#5141F5]/10 text-[#5141F5] flex items-center justify-center">
              <FiShield size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#171717]">
                Welcome, {user?.name || "Staff Member"}
              </h1>
              <p className="text-xs text-[#8A8A8A]">
                STAFF Account • {user?.email}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#F8F7FF] border border-[#E8E2DE] p-5 text-xs text-[#3E3734] leading-relaxed">
            <p className="font-semibold mb-1">Staff Account Activated</p>
            <p className="text-[#8A8A8A]">
              Your Staff account has been successfully verified and activated. You can sign in using your registered email and password.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
