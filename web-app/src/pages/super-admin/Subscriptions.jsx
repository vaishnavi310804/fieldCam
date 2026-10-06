import { useState, useEffect, useCallback } from "react";
import SuperAdminSidebar from "../../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../../components/super-admin/SuperAdminHeader";
import RecentSubscriptionsTable from "../../components/super-admin/RecentSubscriptionsTable";
import DraftSubscriptionPlan from "../../components/super-admin/DraftSubscriptionPlan";
import CreatePlanModal from "../../components/super-admin/CreatePlanModal";
import {
  getSubscriptionPlans,
  getSubscribedCompanies,
  updateSubscriptionStatus,
} from "../../services/subscriptionService";
import { FiPlus, FiCheckCircle, FiPlusCircle } from "react-icons/fi";

const Subscriptions = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 10,
  });
  const [subsLoading, setSubsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState(null);

  // Fetch subscription plans from real backend API
  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const res = await getSubscriptionPlans();
      setPlans(res.data || []);
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch subscribed companies from real backend API
  const fetchSubscribedCompanies = useCallback(async () => {
    try {
      setSubsLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
        planId: planFilter,
      };
      const res = await getSubscribedCompanies(params);
      setSubscriptions(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch subscribed companies:", err);
    } finally {
      setSubsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, planFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchSubscribedCompanies();
  }, [fetchSubscribedCompanies]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = ({ status, planId }) => {
    if (status !== undefined) setStatusFilter(status);
    if (planId !== undefined) setPlanFilter(planId);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (subId, newStatus) => {
    try {
      await updateSubscriptionStatus(subId, newStatus);
      fetchSubscribedCompanies();
    } catch (err) {
      console.error("Failed to update subscription status:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedPlanToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setSelectedPlanToEdit(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex font-sans antialiased text-[#2D3436]">
      {/* Super Admin Navigation Sidebar */}
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main View Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-[220px]"
        }`}
      >
        {/* Super Admin Top Bar Header */}
        <SuperAdminHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content Container */}
        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Page Top Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3436]">
                Subscription Plans
              </h1>
              <p className="text-xs text-[#817B77] mt-1">
                Control global pricing, plan features, and account limits across your enterprise.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#817B77] hover:bg-[#6E6763] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <FiPlus size={16} />
              <span>Create New Plan</span>
            </button>
          </div>

          {/* Section 1: Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansLoading ? (
              <div className="col-span-3 py-16 text-center text-[#817B77]">
                <div className="inline-block w-8 h-8 border-2 border-[#817B77] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs font-medium">Loading subscription plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-3 p-12 bg-white rounded-2xl border border-[#EBE6E3] text-center text-[#817B77]">
                <p className="font-bold text-base text-[#2D3436] mb-1">
                  No subscription plans configured
                </p>
                <p className="text-xs mb-4">
                  Create your first plan using the button above or the draft form below.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#817B77] text-white text-xs font-semibold cursor-pointer"
                >
                  <FiPlusCircle />
                  <span>Create Subscription Plan</span>
                </button>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-xs transition-all ${
                    plan.isPopular
                      ? "border-[#817B77] ring-1 ring-[#817B77]"
                      : "border-[#EBE6E3]"
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <span className="absolute -top-3 right-6 bg-[#817B77] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow-xs">
                      POPULAR
                    </span>
                  )}

                  <div>
                    {/* Header Details */}
                    <h3 className="text-base font-bold text-[#2D3436]">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-extrabold text-[#2D3436]">
                        ${plan.monthlyPrice}
                      </span>
                      <span className="text-xs text-[#817B77]">/mo</span>
                    </div>
                    <p className="text-xs text-[#817B77] mb-6 min-h-[32px]">
                      {plan.subtitle || "Account subscription limits & feature tier."}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3 mb-6 border-t border-[#EBE6E3] pt-5 text-xs text-[#2D3436]">
                      {Array.isArray(plan.features) && plan.features.length > 0 ? (
                        plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <FiCheckCircle
                              className="text-emerald-500 shrink-0"
                              size={15}
                            />
                            <span className="font-medium text-[#2D3436]">{feat}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-center gap-2.5">
                            <FiCheckCircle
                              className="text-emerald-500 shrink-0"
                              size={15}
                            />
                            <span>
                              {plan.userLimit === -1
                                ? "Unlimited Users"
                                : `Up to ${plan.userLimit} Users`}
                            </span>
                          </li>
                          <li className="flex items-center gap-2.5">
                            <FiCheckCircle
                              className="text-emerald-500 shrink-0"
                              size={15}
                            />
                            <span>
                              {plan.storageLimitGb === -1
                                ? "Unlimited Storage"
                                : `${plan.storageLimitGb}GB Storage`}
                            </span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Card Action Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(plan)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      plan.isPopular
                        ? "bg-[#817B77] hover:bg-[#6E6763] text-white shadow-xs"
                        : "bg-[#F5F2F0] hover:bg-[#EBE6E3] text-[#2D3436]"
                    }`}
                  >
                    Edit Plan Details
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Section 2: Recent Subscribed Companies Table */}
          <RecentSubscriptionsTable
            subscriptions={subscriptions}
            pagination={pagination}
            loading={subsLoading}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            onStatusUpdate={handleStatusUpdate}
            plans={plans}
          />

          {/* Section 3: Draft New Subscription Model Form */}
          <DraftSubscriptionPlan
            onPlanCreated={() => {
              fetchPlans();
              fetchSubscribedCompanies();
            }}
          />
        </main>
      </div>

      {/* Create / Edit Plan Modal */}
      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPlans();
          fetchSubscribedCompanies();
        }}
        planToEdit={selectedPlanToEdit}
      />
    </div>
  );
};

export default Subscriptions;
