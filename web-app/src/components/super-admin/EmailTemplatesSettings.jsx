import { useNavigate } from "react-router-dom";
import { FiMail, FiUserCheck, FiKey, FiFileText } from "react-icons/fi";

const EmailTemplatesSettings = () => {
  const navigate = useNavigate();

  const templates = [
    {
      id: "welcome",
      icon: FiUserCheck,
      title: "Welcome Email",
      description: "Sent immediately after user verifies their email address.",
    },
    {
      id: "password-reset",
      icon: FiKey,
      title: "Password Reset",
      description: "Standard transactional email for secure account recovery.",
    },
    {
      id: "invoice-receipt",
      icon: FiFileText,
      title: "Invoice Receipt",
      description: "Monthly billing summary with PDF attachment link.",
    },
  ];

  return (
    <div id="email-templates" className="space-y-3">
      <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2">
        <FiMail className="text-[#817B77]" />
        <span>Email Templates</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tmpl) => {
          const Icon = tmpl.icon;
          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-[#EBE6E3] p-6 flex flex-col justify-between shadow-xs hover:border-[#D8D2CD] transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F5] border border-[#EBE6E3] text-[#817B77] flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-[#2D3436] mb-1">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-[#817B77] min-h-[36px] mb-6">
                  {tmpl.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/super-admin/settings/email-templates/${tmpl.id}`)
                }
                className="w-full py-2.5 rounded-xl bg-[#F5F2F0] hover:bg-[#EBE6E3] text-[#2D3436] text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit Template
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmailTemplatesSettings;
