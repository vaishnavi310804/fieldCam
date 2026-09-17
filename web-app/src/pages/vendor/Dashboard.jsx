import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Vendor Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-2xl font-medium transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">User Session Details</h2>
          <pre className="text-sm bg-white p-4 rounded-xl overflow-x-auto text-slate-800">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
