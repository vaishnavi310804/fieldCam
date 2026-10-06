import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import {
  FiArrowLeft,
  FiEye,
  FiSend,
  FiSave,
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiLink,
  FiImage,
  FiCode,
  FiCopy,
  FiX,
} from "react-icons/fi";

const templatePresets = {
  welcome: {
    title: "Edit Welcome Email",
    subtitle: "Manage the core onboarding email for new users.",
    templateName: "Welcome User Template",
    subject: "Welcome to SaaS Platform, {{user_name}}!",
    category: "Marketing",
    bodyGreeting: "Hi {{user_name}},",
    bodyMain:
      "We are thrilled to have you join {{company_name}}! Your account is now active and you can start exploring all the features available in your dashboard.",
    buttonLabel: "Get Started Now",
    buttonLink: "{{action_link}}",
    bodyClosing:
      "If you have any questions, simply reply to this email and our support team will be happy to help.",
    bodySignoff: "Best regards,\nThe {{company_name}} Team",
  },
  "password-reset": {
    title: "Edit Password Reset Email",
    subtitle: "Standard transactional email for secure account recovery.",
    templateName: "Password Reset Template",
    subject: "Reset Your Password, {{user_name}}",
    category: "Transactional",
    bodyGreeting: "Hello {{user_name}},",
    bodyMain:
      "We received a request to reset the password associated with your {{company_name}} account. Click the button below to specify a new password.",
    buttonLabel: "Reset Password",
    buttonLink: "{{action_link}}",
    bodyClosing:
      "If you did not request a password reset, please ignore this message or contact security immediately.",
    bodySignoff: "Stay safe,\nThe {{company_name}} Security Team",
  },
  "invoice-receipt": {
    title: "Edit Invoice Receipt",
    subtitle: "Monthly billing summary with PDF attachment link.",
    templateName: "Invoice Receipt Template",
    subject: "Your Invoice Receipt for {{company_name}}",
    category: "Billing",
    bodyGreeting: "Dear {{user_name}},",
    bodyMain:
      "Thank you for your business! Your payment for the current billing cycle has been processed successfully.",
    buttonLabel: "View Invoice PDF",
    buttonLink: "{{action_link}}",
    bodyClosing:
      "A copy of this receipt has been saved to your account billing dashboard.",
    bodySignoff: "Sincerely,\nThe {{company_name}} Billing Team",
  },
};

const EditEmailTemplate = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const preset = templatePresets[templateId] || templatePresets.welcome;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [templateName, setTemplateName] = useState(preset.templateName);
  const [subject, setSubject] = useState(preset.subject);
  const [category, setCategory] = useState(preset.category);
  const [isActive, setIsActive] = useState(true);
  const [bodyMain, setBodyMain] = useState(preset.bodyMain);
  const [showHtml, setShowHtml] = useState(false);

  const [activeInput, setActiveInput] = useState("subject"); // 'subject' or 'body'
  const [toastMsg, setToastMsg] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    setTemplateName(preset.templateName);
    setSubject(preset.subject);
    setCategory(preset.category);
    setBodyMain(preset.bodyMain);
  }, [templateId, preset]);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleInsertPlaceholder = (placeholder) => {
    if (activeInput === "subject") {
      setSubject((prev) => prev + " " + placeholder);
    } else {
      setBodyMain((prev) => prev + " " + placeholder);
    }
    showNotification(`Inserted ${placeholder}`);
  };

  const handleSendTest = () => {
    showNotification("Test email functionality is not available yet.");
  };

  const handleSaveChanges = () => {
    showNotification("Settings are currently UI-only.");
  };

  const placeholders = [
    "{{user_name}}",
    "{{company_name}}",
    "{{action_link}}",
    "{{reset_token}}",
    "{{current_year}}",
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex font-sans antialiased text-[#2D3436]">
      {/* Sidebar */}
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main View */}
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

        {/* Content Container */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification Banner */}
          {toastMsg && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium animate-in fade-in duration-200 flex items-center justify-between">
              <span>{toastMsg}</span>
              <button
                type="button"
                onClick={() => setToastMsg("")}
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#817B77]">
            <Link
              to="/super-admin/dashboard"
              className="hover:text-[#2D3436] transition-colors"
            >
              Dashboard
            </Link>
            <span>&gt;</span>
            <Link
              to="/super-admin/settings"
              className="hover:text-[#2D3436] transition-colors"
            >
              Email Templates
            </Link>
            <span>&gt;</span>
            <span className="font-bold text-[#2D3436]">Edit Template</span>
          </nav>

          {/* Title Row & Top Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3436]">
                {preset.title}
              </h1>
              <p className="text-xs text-[#817B77] mt-1">{preset.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/super-admin/settings")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <FiArrowLeft size={14} />
                <span>Back to List</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <FiEye size={14} />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={handleSendTest}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EBE6E3] text-[#6E6763] hover:text-[#2D3436] hover:bg-[#F5F2F0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <FiSend size={14} />
                <span>Send Test</span>
              </button>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <FiSave size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Main Editor) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Template Name & Subject Line */}
              <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 space-y-4 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full h-10 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-4 text-xs text-[#2D3436] outline-none focus:border-[#817B77] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onFocus={() => setActiveInput("subject")}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-10 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-4 text-xs text-[#2D3436] outline-none focus:border-[#817B77] focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Card 2: Editor Box */}
              <div className="bg-white rounded-2xl border border-[#EBE6E3] overflow-hidden shadow-xs">
                {/* Toolbar */}
                <div className="px-4 py-2.5 bg-[#FAF7F5] border-b border-[#EBE6E3] flex flex-wrap items-center gap-2 text-[#6E6763]">
                  <button
                    type="button"
                    title="Bold"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiBold size={14} />
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiItalic size={14} />
                  </button>
                  <button
                    type="button"
                    title="Underline"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiUnderline size={14} />
                  </button>

                  <span className="w-px h-4 bg-[#EBE6E3] mx-1" />

                  <button
                    type="button"
                    title="Align Left"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiAlignLeft size={14} />
                  </button>
                  <button
                    type="button"
                    title="Align Center"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiAlignCenter size={14} />
                  </button>
                  <button
                    type="button"
                    title="Align Right"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiAlignRight size={14} />
                  </button>

                  <span className="w-px h-4 bg-[#EBE6E3] mx-1" />

                  <button
                    type="button"
                    title="Insert Link"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiLink size={14} />
                  </button>
                  <button
                    type="button"
                    title="Insert Image"
                    className="p-1.5 rounded-lg hover:bg-[#EBE6E3] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    <FiImage size={14} />
                  </button>

                  <span className="w-px h-4 bg-[#EBE6E3] mx-1" />

                  <button
                    type="button"
                    onClick={() => setShowHtml(!showHtml)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      showHtml
                        ? "bg-[#817B77] text-white"
                        : "hover:bg-[#EBE6E3] text-[#6E6763]"
                    }`}
                  >
                    <FiCode size={13} />
                    <span>HTML</span>
                  </button>
                </div>

                {/* Editor Content Area */}
                <div className="p-6 space-y-4 text-xs text-[#2D3436] leading-relaxed">
                  <p className="font-semibold">{preset.bodyGreeting}</p>

                  {showHtml ? (
                    <textarea
                      rows={6}
                      value={bodyMain}
                      onFocus={() => setActiveInput("body")}
                      onChange={(e) => setBodyMain(e.target.value)}
                      className="w-full bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl p-3 font-mono text-xs text-[#2D3436] outline-none focus:border-[#817B77]"
                    />
                  ) : (
                    <textarea
                      rows={4}
                      value={bodyMain}
                      onFocus={() => setActiveInput("body")}
                      onChange={(e) => setBodyMain(e.target.value)}
                      className="w-full bg-white border border-transparent hover:border-[#EBE6E3] focus:border-[#817B77] rounded-xl p-2 text-xs text-[#2D3436] outline-none transition-colors"
                    />
                  )}

                  {/* Button Placeholder Box */}
                  <div className="my-6 p-6 rounded-2xl border-2 border-dashed border-[#EBE6E3] bg-[#FAF7F5] text-center space-y-2">
                    <p className="text-[10px] font-bold text-[#817B77] uppercase tracking-wider">
                      Button Placeholder
                    </p>
                    <div>
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-xl bg-[#817B77] text-white text-xs font-semibold shadow-xs cursor-default"
                      >
                        {preset.buttonLabel}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#817B77] font-mono">
                      Link: {preset.buttonLink}
                    </p>
                  </div>

                  <p>{preset.bodyClosing}</p>
                  <p className="whitespace-pre-line text-[#817B77]">
                    {preset.bodySignoff}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (Panels) */}
            <div className="space-y-6">
              {/* Panel 1: Template Settings */}
              <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 space-y-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#2D3436]">
                  Template Settings
                </h3>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#2D3436] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 bg-[#FAF7F5] border border-[#EBE6E3] rounded-xl px-3 text-xs text-[#2D3436] outline-none focus:border-[#817B77]"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D3436]">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-600">
                        {isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? "bg-[#817B77]" : "bg-[#EBE6E3]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#817B77]">
                    This template will be available for automated workflows.
                  </p>
                </div>

                {/* Available Placeholders */}
                <div className="space-y-2 pt-2 border-t border-[#EBE6E3]">
                  <label className="block text-xs font-bold text-[#2D3436]">
                    Available Placeholders
                  </label>
                  <div className="space-y-1.5">
                    {placeholders.map((ph) => (
                      <button
                        key={ph}
                        type="button"
                        onClick={() => handleInsertPlaceholder(ph)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F5] hover:bg-[#F5F2F0] border border-[#EBE6E3] text-xs text-[#2D3436] font-mono transition-colors cursor-pointer group"
                      >
                        <span>{ph}</span>
                        <FiCopy className="text-[#817B77] group-hover:text-[#2D3436]" size={13} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#817B77] text-center pt-1">
                    Click a tag to copy to clipboard
                  </p>
                </div>
              </div>

              {/* Panel 2: Template History */}
              <div className="bg-white rounded-2xl border border-[#EBE6E3] p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#2D3436]">
                  Template History
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#817B77] mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-[#2D3436]">Updated content</p>
                      <p className="text-[11px] text-[#817B77]">
                        by Alex Rivera • 2h ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-[#2D3436]">Changed category</p>
                      <p className="text-[11px] text-[#817B77]">
                        by System • Yesterday
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EBE6E3] text-center">
                  <button
                    type="button"
                    onClick={() => showNotification("Audit logs are UI-only.")}
                    className="text-xs font-semibold text-[#817B77] hover:text-[#2D3436] transition-colors cursor-pointer"
                  >
                    View Full Audit Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-[#EBE6E3] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[#EBE6E3] flex items-center justify-between bg-[#FAF7F5]">
              <h3 className="text-sm font-bold text-[#2D3436]">
                Email Preview: {subject}
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-[#817B77] hover:text-[#2D3436] cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-[#2D3436]">
              <p className="font-semibold">{preset.bodyGreeting}</p>
              <p>{bodyMain}</p>

              <div className="py-4 text-center">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-[#817B77] text-white text-xs font-semibold"
                >
                  {preset.buttonLabel}
                </button>
              </div>

              <p>{preset.bodyClosing}</p>
              <p className="whitespace-pre-line text-[#817B77]">
                {preset.bodySignoff}
              </p>
            </div>

            <div className="px-6 py-3 bg-[#FAF7F5] border-t border-[#EBE6E3] text-right">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-[#817B77] text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEmailTemplate;
