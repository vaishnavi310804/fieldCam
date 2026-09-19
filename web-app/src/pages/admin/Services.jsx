import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import GeneralInformation from "../../components/admin/services/GeneralInformation";
import PhotoChecklist from "../../components/admin/services/PhotoChecklist";
import WorkflowRules from "../../components/admin/services/WorkflowRules";
import ConfigurationSummary from "../../components/admin/services/ConfigurationSummary";
import { useAuth } from "../../context/AuthContext";
import {
  getServices,
  createService,
  updateService,
  updateServiceStatus,
} from "../../services/serviceService";
import { FiCheckCircle, FiAlertCircle, FiPlus, FiTag, FiToggleLeft, FiToggleRight, FiLoader } from "react-icons/fi";

const DEFAULT_CHECKLIST = [];

const Services = () => {
  const { user } = useAuth();
  const readOnly = user?.role === "VENDOR";

  const [collapsed, setCollapsed] = useState(false);

  // Services API State
  const [servicesList, setServicesList] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Controlled Form State
  const [serviceCategory, setServiceCategory] = useState("Maintenance");
  const [serviceTypeName, setServiceTypeName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("0.00");
  const [checklistItems, setChecklistItems] = useState(DEFAULT_CHECKLIST);
  const [serviceLogic, setServiceLogic] = useState("IF service_duration > 2h...");
  const [requireSignature, setRequireSignature] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [notifyClient, setNotifyClient] = useState(true);
  const [processingMode, setProcessingMode] = useState("AUTOMATIC");
  const [currentStatus, setCurrentStatus] = useState("ACTIVE");

  // Feedback State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getServices();
      const fetched = response.data || [];
      setServicesList(fetched);

      if (fetched.length > 0 && !selectedServiceId) {
        populateFormWithService(fetched[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  const populateFormWithService = (service) => {
    setSelectedServiceId(service._id);
    setServiceCategory(service.serviceCategory || "Maintenance");
    setServiceTypeName(service.serviceTypeName || "");
    setDefaultPrice(service.defaultPrice !== undefined ? service.defaultPrice.toString() : "0.00");
    setChecklistItems(service.photoChecklistRequirements || []);
    setServiceLogic(service.serviceLogic || "");
    setRequireSignature(service.requireSignature !== undefined ? service.requireSignature : true);
    setAutoApprove(service.autoApprove !== undefined ? service.autoApprove : false);
    setNotifyClient(service.notifyClient !== undefined ? service.notifyClient : true);
    setProcessingMode(service.processingMode || "AUTOMATIC");
    setCurrentStatus(service.status || "ACTIVE");
    setSaveSuccess(false);
    setValidationError("");
  };

  const handleCreateNew = () => {
    setSelectedServiceId(null);
    setServiceCategory("Maintenance");
    setServiceTypeName("");
    setDefaultPrice("0.00");
    setChecklistItems(DEFAULT_CHECKLIST);
    setServiceLogic("IF service_duration > 2h THEN\napply_buffer_30m...");
    setRequireSignature(true);
    setAutoApprove(false);
    setNotifyClient(true);
    setProcessingMode("AUTOMATIC");
    setCurrentStatus("ACTIVE");
    setSaveSuccess(false);
    setValidationError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (readOnly) return;

    setSaveSuccess(false);
    setValidationError("");

    if (!serviceCategory) {
      setValidationError("Please select a Service Category.");
      return;
    }
    if (!serviceTypeName.trim()) {
      setValidationError("Please enter a Service Type Name.");
      return;
    }
    if (defaultPrice === "" || isNaN(parseFloat(defaultPrice))) {
      setValidationError("Please enter a valid Default Price.");
      return;
    }

    const payload = {
      serviceCategory,
      serviceTypeName: serviceTypeName.trim(),
      defaultPrice: parseFloat(defaultPrice),
      photoChecklistRequirements: checklistItems.map((item) => ({
        title: item.title,
        requirementType: item.requirementType || "REQUIRED",
        photoType: item.photoType || "GENERAL",
      })),
      serviceLogic,
      requireSignature,
      autoApprove,
      notifyClient,
      processingMode,
    };

    try {
      setSaveLoading(true);
      let res;
      if (selectedServiceId) {
        res = await updateService(selectedServiceId, payload);
      } else {
        res = await createService(payload);
      }

      setSaveSuccess(true);
      const savedService = res.data;
      await fetchServicesData();
      if (savedService) {
        populateFormWithService(savedService);
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setValidationError(
        err.response?.data?.message || err.message || "Failed to save configuration"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedServiceId || readOnly) return;
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setSaveLoading(true);
      const res = await updateServiceStatus(selectedServiceId, newStatus);
      setCurrentStatus(res.data.status);
      await fetchServicesData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setValidationError(
        err.response?.data?.message || err.message || "Failed to update service status"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (selectedServiceId) {
      const found = servicesList.find((s) => s._id === selectedServiceId);
      if (found) populateFormWithService(found);
    } else {
      handleCreateNew();
    }
  };

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      {/* Fixed Sidebar */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Container Area */}
      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        {/* Top Header */}
        <AdminHeader
          title="Service Configuration"
          subtitle="Manage and track all field operation projects."
          showSearch={true}
        />

        {/* Main Body */}
        <main className="flex-1 p-6 space-y-6">
          {/* Page Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#3E3734]">Service Details</h1>
              <p className="text-xs text-[#817B77] mt-0.5">
                Define the core rules, pricing, and required documentation for this service.
              </p>
            </div>

            {/* Action Buttons */}
            {!readOnly && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saveLoading}
                  className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saveLoading && <FiLoader className="animate-spin text-xs" />}
                  <span>{selectedServiceId ? "Save Configuration" : "Create Service"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Service Selector & Status Bar */}
          <div className="bg-white border border-[#E8E2DE] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
              <span className="text-xs font-bold text-[#817B77] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <FiTag className="text-xs" />
                Services:
              </span>
              {servicesList.map((srv) => (
                <button
                  key={srv._id}
                  onClick={() => populateFormWithService(srv)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedServiceId === srv._id
                      ? "bg-[#8A817C] text-white shadow-sm"
                      : "bg-[#FAF7F5] text-[#6E6763] hover:bg-[#F2EBE5] border border-[#E8E2DE]"
                  }`}
                >
                  <span>{srv.serviceTypeName}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      srv.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {srv.status}
                  </span>
                </button>
              ))}

              {servicesList.length === 0 && !loading && (
                <span className="text-xs text-[#817B77] italic">No services configured yet.</span>
              )}
            </div>

            {!readOnly && (
              <div className="flex items-center gap-2">
                {selectedServiceId && (
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={saveLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border shadow-sm ${
                      currentStatus === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {currentStatus === "ACTIVE" ? (
                      <FiToggleRight className="text-base text-emerald-600" />
                    ) : (
                      <FiToggleLeft className="text-base text-gray-500" />
                    )}
                    <span>Status: {currentStatus}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="bg-[#F2EBE5] hover:bg-[#E8E2DE] text-[#3E3734] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <FiPlus className="text-xs" />
                  <span>New Service</span>
                </button>
              </div>
            )}
          </div>

          {/* Inline Feedback Alerts */}
          {loading && (
            <div className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#817B77] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <FiLoader className="animate-spin text-base shrink-0" />
              <span>Loading services configuration from backend...</span>
            </div>
          )}

          {error && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
              <FiCheckCircle className="text-base shrink-0" />
              <span>Configuration saved successfully!</span>
            </div>
          )}

          {validationError && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Left Column (General Info & Photo Checklist) */}
            <div className="lg:col-span-2 space-y-5">
              <GeneralInformation
                serviceCategory={serviceCategory}
                setServiceCategory={setServiceCategory}
                serviceTypeName={serviceTypeName}
                setServiceTypeName={setServiceTypeName}
                defaultPrice={defaultPrice}
                setDefaultPrice={setDefaultPrice}
                readOnly={readOnly}
              />

              <PhotoChecklist
                checklistItems={checklistItems}
                setChecklistItems={setChecklistItems}
                readOnly={readOnly}
              />
            </div>

            {/* Right Column (Workflow Rules & Configuration Summary) */}
            <div className="lg:col-span-1 space-y-5">
              <WorkflowRules
                serviceLogic={serviceLogic}
                setServiceLogic={setServiceLogic}
                requireSignature={requireSignature}
                setRequireSignature={setRequireSignature}
                autoApprove={autoApprove}
                setAutoApprove={setAutoApprove}
                notifyClient={notifyClient}
                setNotifyClient={setNotifyClient}
                processingMode={processingMode}
                setProcessingMode={setProcessingMode}
                readOnly={readOnly}
              />

              <ConfigurationSummary
                serviceCategory={serviceCategory}
                checklistCount={checklistItems.length}
                processingMode={processingMode}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Services;
