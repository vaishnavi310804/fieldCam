import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ProjectGeneralInformation from "../../components/admin/projects/ProjectGeneralInformation";
import ProjectOperationalDetails from "../../components/admin/projects/ProjectOperationalDetails";
import ProjectPhotoChecklist from "../../components/admin/projects/ProjectPhotoChecklist";
import ProjectDescription from "../../components/admin/projects/ProjectDescription";
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

  // Controlled Form State
  const [projectName, setProjectName] = useState("");
  const [client, setClient] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [assignedVendor, setAssignedVendor] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [checklistItems, setChecklistItems] = useState(initialChecklist);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");

  // Validation & Success Feedback State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleInitializeProject = (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setValidationError("");

    // Required Field Validations
    if (!projectName.trim()) {
      setValidationError("Please enter a Project Name.");
      return;
    }
    if (!client.trim()) {
      setValidationError("Please select or enter a Client.");
      return;
    }
    if (!serviceType) {
      setValidationError("Please select a Service Type.");
      return;
    }
    if (!deadline) {
      setValidationError("Please select a Deadline date.");
      return;
    }

    // Success Feedback
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
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
              <span>Project ready to be initialized.</span>
            </div>
          )}

          {validationError && (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-5">
            <ProjectGeneralInformation
              projectName={projectName}
              setProjectName={setProjectName}
              client={client}
              setClient={setClient}
              serviceType={serviceType}
              setServiceType={setServiceType}
            />

            {/* Card 2: Operational Details */}
            <ProjectOperationalDetails
              assignedVendor={assignedVendor}
              setAssignedVendor={setAssignedVendor}
              deadline={deadline}
              setDeadline={setDeadline}
              location={location}
              setLocation={setLocation}
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
                className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleInitializeProject}
                className="flex items-center gap-1.5 bg-[#8A817C] hover:bg-[#6E6763] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <FiSend className="text-xs" />
                <span>Initialize Project</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateProject;
