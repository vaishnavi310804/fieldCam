import { useState, useEffect } from "react";
import { getVendorById } from "../../../services/vendorService";
import VendorStatusBadge from "./VendorStatusBadge";
import {
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiStar,
  FiBriefcase,
  FiAlertCircle,
  FiLoader,
  FiUserCheck,
  FiCreditCard,
  FiCheck,
} from "react-icons/fi";

const VendorProfileModal = ({ isOpen, onClose, vendor }) => {
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!isOpen || !vendor?._id) return;

    const fetchVendorProfile = async () => {
      setVendorDetails(null);
      setLoading(true);
      setError("");

      try {
        const res = await getVendorById(vendor._id);
        const fetchedData = res?.data || res || null;
        if (isMounted) {
          setVendorDetails(fetchedData);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load vendor profile."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVendorProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, vendor?._id]);

  if (!isOpen || !vendor) return null;

  // Extract merged fields safely from live API response or fallback card props
  const activeDoc = vendorDetails || vendor;
  const company = activeDoc.companyName || activeDoc.company || "Unnamed Vendor";
  const contact = activeDoc.contactName || activeDoc.contact || "No Contact";
  const initials =
    activeDoc.initials ||
    company
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const avatarBg = activeDoc.avatarBg || "#8A817C";
  const status = activeDoc.status || "Active";
  const location = activeDoc.location || "N/A";
  const rating = activeDoc.rating ?? 4.0;
  const servicesList = Array.isArray(activeDoc.services)
    ? activeDoc.services
    : [];

  const rawJoined = activeDoc.joinedDate || activeDoc.createdAt;
  const joinedDateFormatted = rawJoined
    ? new Date(rawJoined).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  // Safely extract populated User info if returned by backend
  const userAccount =
    typeof activeDoc.userId === "object" ? activeDoc.userId : null;
  const email = userAccount?.email || activeDoc.email || "Not Provided";
  const phone = userAccount?.phone || activeDoc.phone || "Not Provided";
  const userRole = userAccount?.role || "VENDOR";
  const isUserVerified = userAccount?.isVerified ?? true;

  // Safely extract subscription and plan info
  const subscription = activeDoc?.subscription || null;
  const plan =
    subscription?.planId && typeof subscription.planId === "object"
      ? subscription.planId
      : null;

  const planName = plan?.name || subscription?.planName || "Unnamed Plan";
  const planCode = plan?.code || subscription?.planCode || "";
  const planSubtitle = plan?.subtitle || "";

  const subStartDate = subscription?.startDate
    ? new Date(subscription.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const rawSubExpiry = subscription?.renewalDate || subscription?.expiryDate;
  const subExpiryDate = rawSubExpiry
    ? new Date(rawSubExpiry).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const subMonthlyPrice =
    plan?.monthlyPrice !== undefined && plan?.monthlyPrice !== null
      ? `$${plan.monthlyPrice} / ${plan.billingInterval === "YEARLY" ? "yr" : "mo"}`
      : "N/A";

  const subUserLimit =
    plan?.userLimit === -1 || plan?.userLimit === "Unlimited"
      ? "Unlimited"
      : plan?.userLimit !== undefined && plan?.userLimit !== null
      ? `${plan.userLimit} Users`
      : "N/A";

  const subStorageLimit =
    plan?.storageLimitGb === -1 || plan?.storageLimitGb === "Unlimited"
      ? "Unlimited"
      : plan?.storageLimitGb !== undefined && plan?.storageLimitGb !== null
      ? `${plan.storageLimitGb} GB`
      : "N/A";

  const subFeatures = Array.isArray(plan?.features) ? plan.features : [];

  const getSubBadge = (subStatus) => {
    switch (subStatus) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "Past Due":
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {subStatus}
          </span>
        );
      case "Cancelled":
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {subStatus}
          </span>
        );
      case "Trial":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Trial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {subStatus || "Active"}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#EEE9E6] border border-[#E8E2DE] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3E3734]">Vendor Profile</h2>
            <p className="text-xs text-[#817B77] mt-0.5">
              Detailed profile information for{" "}
              <span className="font-semibold text-[#3E3734]">{company}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#817B77] hover:text-[#3E3734] p-1.5 rounded-xl hover:bg-[#EAE4DF] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Loading State Alert */}
        {loading && (
          <div className="bg-[#FAF7F5] border border-[#E8E2DE] text-[#817B77] px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiLoader className="animate-spin text-base shrink-0" />
            <span>Loading live vendor profile from backend...</span>
          </div>
        )}

        {/* Error State Alert */}
        {error && (
          <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Vendor Header Banner Card */}
        <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Circle */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>

            <div>
              <h3 className="text-base font-bold text-[#3E3734] leading-tight">
                {company}
              </h3>
              <p className="text-xs text-[#817B77] mt-0.5 flex items-center gap-1.5">
                <span>{contact}</span>
                <span className="text-[#D1C9C3]">•</span>
                <span className="text-[11px] font-semibold text-[#8A817C] uppercase tracking-wider">
                  {userRole}
                </span>
              </p>
            </div>
          </div>

          <VendorStatusBadge status={status} />
        </div>

        {/* Contact & Account Information Card */}
        <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <h4 className="text-xs font-bold text-[#3E3734] uppercase tracking-wider">
            Contact Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Email */}
            <div className="flex items-center gap-2.5 bg-[#FAF7F5] border border-[#F2EBE5] p-3 rounded-xl">
              <FiMail className="text-sm text-[#817B77] shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Email Address
                </span>
                <span className="font-semibold text-[#3E3734] truncate block">
                  {email}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2.5 bg-[#FAF7F5] border border-[#F2EBE5] p-3 rounded-xl">
              <FiPhone className="text-sm text-[#817B77] shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Phone Number
                </span>
                <span className="font-semibold text-[#3E3734]">{phone}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 bg-[#FAF7F5] border border-[#F2EBE5] p-3 rounded-xl">
              <FiMapPin className="text-sm text-[#817B77] shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Location / Region
                </span>
                <span className="font-semibold text-[#3E3734]">
                  {location}
                </span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-2.5 bg-[#FAF7F5] border border-[#F2EBE5] p-3 rounded-xl">
              <FiUserCheck className="text-sm text-[#817B77] shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Account Status
                </span>
                <span className="font-semibold text-[#2E7D32] flex items-center gap-1">
                  {isUserVerified ? "Verified Account" : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details Card */}
        <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#3E3734] uppercase tracking-wider flex items-center gap-1.5">
              <FiCreditCard className="text-[#817B77]" />
              <span>Subscription Details</span>
            </h4>
            {subscription && !loading && !error && getSubBadge(subscription.status)}
          </div>

          {loading ? (
            <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-4 text-center text-[#817B77]">
              <FiLoader className="animate-spin text-base mx-auto mb-1 text-[#817B77]" />
              <p className="text-xs font-medium">Loading subscription details...</p>
            </div>
          ) : error ? (
            <div className="bg-[#FFEBEE] border border-[#C62828]/20 text-[#C62828] p-3 rounded-xl text-xs flex items-center gap-2">
              <FiAlertCircle className="text-base shrink-0" />
              <div>
                <span className="font-bold block">Subscription data unavailable</span>
                <span className="text-[11px] text-[#C62828]/90">Could not retrieve subscription details due to an API error.</span>
              </div>
            </div>
          ) : !subscription || !plan ? (
            <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-[#EAE4DF] text-[#817B77] flex items-center justify-center mx-auto mb-2">
                <FiCreditCard className="text-sm" />
              </div>
              <p className="text-xs font-bold text-[#3E3734]">
                No subscription plan assigned
              </p>
              <p className="text-[11px] text-[#817B77] mt-0.5">
                This company does not currently have an active subscription package.
              </p>
            </div>
          ) : (
            <>
              {/* Plan Banner */}
              <div className="bg-[#FAF7F5] border border-[#F2EBE5] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#3E3734]">
                      {planName}
                    </span>
                    {planCode && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#EAE4DF] text-[#6E6763]">
                        {planCode}
                      </span>
                    )}
                  </div>
                  {planSubtitle && (
                    <p className="text-[11px] text-[#817B77] mt-0.5">
                      {planSubtitle}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#3E3734]">
                    {subMonthlyPrice}
                  </span>
                  {subscription.durationMonths && (
                    <span className="block text-[10px] font-semibold text-[#817B77]">
                      {subscription.durationMonths} month duration
                    </span>
                  )}
                </div>
              </div>

              {/* Grid: Start Date, Expiry / Renewal Date, User Limit, Storage Limit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAF7F5] rounded-xl p-3 text-center border border-[#F2EBE5]">
                <div>
                  <span className="block text-xs font-bold text-[#3E3734] truncate">
                    {subStartDate}
                  </span>
                  <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
                    START DATE
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#3E3734] truncate">
                    {subExpiryDate}
                  </span>
                  <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
                    RENEWAL / EXPIRY
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#3E3734] truncate">
                    {subUserLimit}
                  </span>
                  <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
                    USER LIMIT
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#3E3734] truncate">
                    {subStorageLimit}
                  </span>
                  <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
                    STORAGE LIMIT
                  </span>
                </div>
              </div>

              {/* Plan Features */}
              {subFeatures.length > 0 && (
                <div className="pt-2 border-t border-[#F2EBE5]">
                  <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider mb-2">
                    Included Plan Features
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {subFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-[#6E6763]"
                      >
                        <FiCheck className="text-emerald-600 shrink-0 text-xs" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Vendor Details & Services Card */}
        <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <h4 className="text-xs font-bold text-[#3E3734] uppercase tracking-wider">
            Vendor Details
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="flex items-center gap-2">
              <FiStar className="text-amber-500 fill-amber-500 text-sm" />
              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Rating
                </span>
                <span className="font-bold text-[#3E3734]">{rating} / 5.0</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="text-sm text-[#817B77]" />
              <div>
                <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                  Joined Date
                </span>
                <span className="font-semibold text-[#3E3734]">
                  {joinedDateFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Services Provided */}
          <div>
            <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider mb-2">
              Services Offered
            </span>
            <div className="flex flex-wrap gap-1.5">
              {servicesList.length > 0 ? (
                servicesList.map((service, idx) => (
                  <span
                    key={idx}
                    className="bg-[#F2EBE5] text-[#6E6763] px-3 py-1 rounded-md text-xs font-semibold"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#A39A94] italic">
                  No services listed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Project Metrics Summary Card */}
        <div className="bg-white border border-[#E8E2DE] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <h4 className="text-xs font-bold text-[#3E3734] uppercase tracking-wider flex items-center gap-1.5">
            <FiBriefcase className="text-[#817B77]" />
            <span>Project Overview</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAF7F5] rounded-xl p-3 text-center border border-[#F2EBE5]">
            <div>
              <span className="block text-sm font-bold text-[#3E3734]">
                {activeDoc.projectStats?.assigned ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-[#A39A94] tracking-wider mt-0.5 uppercase">
                ASSIGNED
              </span>
            </div>
            <div>
              <span className="block text-sm font-bold text-[#3E3734]">
                {activeDoc.projectStats?.active ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-[#8A817C] tracking-wider mt-0.5 uppercase">
                ACTIVE
              </span>
            </div>
            <div>
              <span className="block text-sm font-bold text-[#3E3734]">
                {activeDoc.projectStats?.completed ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-[#2E7D32] tracking-wider mt-0.5 uppercase">
                COMPLETED
              </span>
            </div>
            <div>
              <span className="block text-sm font-bold text-[#3E3734]">
                {activeDoc.projectStats?.waitingForApproval ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-[#C62828] tracking-wider mt-0.5 uppercase">
                WAITING APPROVAL
              </span>
            </div>
          </div>

          {/* Assigned Projects Detail List */}
          {Array.isArray(activeDoc.projects) && activeDoc.projects.length > 0 && (
            <div className="pt-2 border-t border-[#F2EBE5] space-y-2">
              <span className="block text-[10px] font-bold text-[#A39A94] uppercase tracking-wider">
                Assigned Projects ({activeDoc.projects.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeDoc.projects.map((proj) => (
                  <div
                    key={proj._id}
                    className="bg-[#FAF7F5] border border-[#F2EBE5] p-2.5 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#3E3734] block">
                        {proj.projectName}
                      </span>
                      <span className="text-[10px] text-[#817B77]">
                        {proj.projectId} • {proj.serviceTypeName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8E2DE] text-[#3E3734]">
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-end border-t border-[#F2EBE5]">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-[#F2EBE5] text-[#6E6763] hover:text-[#3E3734] border border-[#E8E2DE] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FiX className="text-xs" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileModal;
