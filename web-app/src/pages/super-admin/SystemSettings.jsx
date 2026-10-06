import { useState } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import NotificationTemplatesSettings from "../../components/super-admin/NotificationTemplatesSettings";
import EmailTemplatesSettings from "../../components/super-admin/EmailTemplatesSettings";
import AIValidationSettings from "../../components/super-admin/AIValidationSettings";
import SecurityAuthenticationSettings from "../../components/super-admin/SecurityAuthenticationSettings";
import { FiBell, FiMail, FiCpu, FiShield } from "react-icons/fi";

const SystemSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex font-sans antialiased text-[#2D3436]">
      {/* Super Admin Navigation Sidebar */}
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-[220px]"
        }`}
      >
        {/* Header */}
        <SuperAdminHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main View */}
        <main className="p-6 md:p-8 space-y-10 max-w-7xl w-full mx-auto">
          {/* Page Top Title Row */}
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436]">
              System Settings
            </h1>
            <p className="text-xs text-[#817B77] mt-1">
              Configure global platform behavior and security protocols.
            </p>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-[#EBE6E3] pb-3 text-xs font-semibold text-[#817B77] overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => scrollToSection("notification-templates")}
              className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "notification-templates" || activeTab === "all"
                  ? "text-[#2D3436] font-bold border-b-2 border-[#817B77]"
                  : "hover:text-[#2D3436]"
              }`}
            >
              <FiBell size={14} />
              <span>Notification Templates</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("email-templates")}
              className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "email-templates"
                  ? "text-[#2D3436] font-bold border-b-2 border-[#817B77]"
                  : "hover:text-[#2D3436]"
              }`}
            >
              <FiMail size={14} />
              <span>Email Templates</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("ai-validation")}
              className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "ai-validation"
                  ? "text-[#2D3436] font-bold border-b-2 border-[#817B77]"
                  : "hover:text-[#2D3436]"
              }`}
            >
              <FiCpu size={14} />
              <span>AI Validation</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("security")}
              className={`flex items-center gap-2 pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "security"
                  ? "text-[#2D3436] font-bold border-b-2 border-[#817B77]"
                  : "hover:text-[#2D3436]"
              }`}
            >
              <FiShield size={14} />
              <span>Security</span>
            </button>
          </div>

          {/* Section 1: Notification Templates */}
          <NotificationTemplatesSettings />

          {/* Section 2: Email Templates */}
          <EmailTemplatesSettings />

          {/* Section 3: AI Validation Settings */}
          <AIValidationSettings />

          {/* Section 4: Security & Authentication */}
          <SecurityAuthenticationSettings />
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;
