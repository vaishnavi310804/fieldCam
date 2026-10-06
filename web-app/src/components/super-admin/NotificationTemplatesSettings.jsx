import { useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";

const NotificationTemplatesSettings = () => {
  const defaultItems = [
    {
      id: "signup",
      trigger: "New User Signup",
      inApp: true,
      push: false,
      status: "ACTIVE",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "balance",
      trigger: "Low Account Balance",
      inApp: true,
      push: true,
      status: "CRITICAL",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "renewal",
      trigger: "Subscription Renewal Failed",
      inApp: true,
      push: true,
      status: "URGENT",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  const [items, setItems] = useState(defaultItems);

  const toggleCheck = (id, field) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const handleRestoreDefaults = () => {
    setItems(defaultItems);
  };

  return (
    <div id="notification-templates" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2">
          <FiBell className="text-[#817B77]" />
          <span>Notification Templates</span>
        </h2>
        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="text-xs font-semibold text-[#817B77] hover:text-[#2D3436] transition-colors cursor-pointer"
        >
          Restore Defaults
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE6E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#EBE6E3] text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                <th className="py-3 px-6">System Trigger</th>
                <th className="py-3 px-6 text-center">In-App</th>
                <th className="py-3 px-6 text-center">Push</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE6E3] text-xs text-[#2D3436]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F5]/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#2D3436]">
                    {item.trigger}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id, "inApp")}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-colors cursor-pointer ${
                        item.inApp
                          ? "bg-[#817B77] border-[#817B77] text-white"
                          : "bg-white border-[#D8D2CD]"
                      }`}
                    >
                      {item.inApp && <FiCheck size={14} />}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id, "push")}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border transition-colors cursor-pointer ${
                        item.push
                          ? "bg-[#817B77] border-[#817B77] text-white"
                          : "bg-white border-[#D8D2CD]"
                      }`}
                    >
                      {item.push && <FiCheck size={14} />}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplatesSettings;
