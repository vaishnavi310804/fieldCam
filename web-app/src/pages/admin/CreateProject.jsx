import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ProjectGeneralInformation from "../../components/admin/projects/ProjectGeneralInformation";
import ProjectOperationalDetails from "../../components/admin/projects/ProjectOperationalDetails";
import ProjectPhotoChecklist from "../../components/admin/projects/ProjectPhotoChecklist";
import ProjectDescription from "../../components/admin/projects/ProjectDescription";
import { getServices } from "../../services/serviceService";
import { getVendors } from "../../services/vendorService";
import { createProject } from "../../services/projectService";
import { FiCheckCircle, FiAlertCircle, FiSend } from "react-icons/fi";

const initialChecklist = [
  { id: 1, label: "Site Exterior View", checked: false },
  { id: 2, label: "Main Entrance/Access Points", checked: false },
  { id: 3, label: "Equipment & Machinery", checked: false },
  { id: 4, label: "Interior Spaces/Work Areas", checked: false },
  { id: 5, label: "Safety Signage & Hazards", checked: false },
  { id: 6, label: "Utilities & Infrastructure", checked: false },
  { id: 7, label: "Permits & Documentation", checked: false },
  { id: 8, label: "Team/Personnel On-site", checked: false },
];

const CreateProject = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Dynamic Options State from API
  const [services, setServices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Controlled Form State
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [checklistItems, setChecklistItems] = useState(initialChecklist);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");

  // Submitting, Validation & Success Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [servicesRes, vendorsRes] = await Promise.all([
          getServices(),
          getVendors(),
        ]);

        const activeServicesList = (servicesRes?.data || []).filter(
          (s) => s.status === "ACTIVE"
        );
        const activeVendorsList = (vendorsRes?.data || []).filter(
          (v) => v.status === "Active"
        );

        setServices(activeServicesList);
        setVendors(activeVendorsList);
      } catch (err) {
        setValidationError(
          err.response?.data?.message || "Failed to load active services and vendors"
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleInitializeProject = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setValidationError("");

    // Required Field Validations
    if (!projectName.trim()) {
      setValidationError("Please enter a Project Name.");
      return;
    }
    if (!client.trim()) {
      setValidationError("Please enter a Client.");
      return;
    }
    if (!serviceId) {
      setValidationError("Please select a Service Type.");
      return;
    }
    if (!deadline) {
      setValidationError("Please select a Deadline date.");
      return;
    }
    if (!location.trim()) {
      setValidationError("Please enter a Location.");
      return;
    }

    const selectedService = services.find((s) => s._id === serviceId);
    const selectedVendor = vendors.find((v) => v._id === vendorId);

    const generatedProjectId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      projectId: generatedProjectId,
      projectName: projectName.trim(),
      client: client.trim(),
      serviceId: serviceId,
      serviceTypeName: selectedService ? selectedService.serviceTypeName : "",
      location: location.trim(),
      deadline: deadline,
    };

    if (vendorId) {
      payload.vendorId = vendorId;
      payload.vendorName = selectedVendor ? selectedVendor.companyName : "";
    }

    if (description.trim()) {
      payload.description = description.trim();
    }

    if (checklistItems && checklistItems.length > 0) {
      payload.checklistItems = checklistItems.map((item, idx) => ({
        id: String(item.id || idx + 1),
        label: item.label,
        checked: Boolean(item.checked),
      }));
    }

    try {
      setIsSubmitting(true);
      await createProject(payload);
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/admin/projects");
      }, 1500);
    } catch (err) {
      setValidationError(
        err.response?.data?.message || err.message || "Failed to create project."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/projects");
  };

  return (
    <div className="min-h-screen bg-[#221F1E] text-[#3E3734] font-sans antialiased">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`min-h-screen bg-[#EEE9E6] flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[170px]"
        } ml-0`}
      >
        <AdminHeader
          title="Create New Project"
          subtitle="Initiate a new operational task by filling out the details below. All fields marked with * are required."
          showSearch={true}
        />

        <main className="flex-1 p-6 space-y-6">
          {saveSuccess && (
            <div className="bg-[#E8F5E9] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
              <FiCheckCircle className="text-base shrink-0" />
              <span>Project created successfully! Redirecting...</span>
            </div>
          )}

          {validationError && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {loadingData ? (
            <div className="bg-white border border-[#E8E2DE] rounded-2xl p-8 text-center text-xs text-[#817B77]">
              Loading active services and vendors...
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">
              <ProjectGeneralInformation
                projectName={projectName}
                setProjectName={setProjectName}
                client={client}
                setClient={setClient}
                serviceId={serviceId}
                setServiceId={setServiceId}
                services={services}
              />

              {/* Card 2: Operational Details */}
              <ProjectOperationalDetails
                vendorId={vendorId}
                setVendorId={setVendorId}
                deadline={deadline}
                setDeadline={setDeadline}
                location={location}
                setLocation={setLocation}
                vendors={vendors}
              />

              {/* Card 3: Photo Checklist */}
              <ProjectPhotoChecklist
                checklistItems={checklistItems}
                setChecklistItems={setChecklistItems}
                photos={photos}
                setPhotos={setPhotos}
                photoError={photoError}
                setPhotoError={setPhotoError}
              />

              {/* Card 4: Project Description */}
              <ProjectDescription
                description={description}
                setDescription={setDescription}
                attachments={attachments}
                setAttachments={setAttachments}
                attachmentError={attachmentError}
                setAttachmentError={setAttachmentError}
              />

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleInitializeProject}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  <FiSend className="text-xs" />
                  <span>{isSubmitting ? "Creating..." : "Initialize Project"}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CreateProject;
