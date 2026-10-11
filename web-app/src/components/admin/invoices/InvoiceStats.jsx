import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
} from "react-icons/fi";

const InvoiceStats = ({ statsData = {} }) => {
  const totalInvoiced = statsData.totalInvoiced ?? statsData.totalOutstanding ?? 0;
  
  const awaitingReviewCount =
    statsData.awaitingReview?.count ?? statsData.pendingReview ?? 0;
  const awaitingReviewAmount = statsData.awaitingReview?.amount ?? 0;

  const awaitingPaymentCount =
    statsData.approvedAwaitingPayment?.count ?? statsData.approved ?? 0;
  const awaitingPaymentAmount = statsData.approvedAwaitingPayment?.amount ?? 0;

  const actualPaidAmount =
    statsData.actualPaidEarnings?.amount ??
    (statsData.actualPaidEarnings && typeof statsData.actualPaidEarnings === "number"
      ? statsData.actualPaidEarnings
      : 0);
  const paidThisMonth = statsData.paidThisMonth ?? 0;

  const overdueCount = statsData.overdueUnpaid?.count ?? 0;
  const overdueAmount = statsData.overdueUnpaid?.amount ?? 0;

  const cardItems = [
    {
      id: "total_invoiced",
      label: "Total Invoiced",
      value: `$${Number(totalInvoiced).toLocaleString()}`,
      subtext: statsData.drafts?.count > 0 ? `${statsData.drafts.count} draft${statsData.drafts.count > 1 ? "s" : ""}` : null,
      icon: FiDollarSign,
      bg: "bg-[#FCECE7]",
      iconColor: "text-[#C87A65]",
    },
    {
      id: "awaiting_review",
      label: "Awaiting Review",
      value: `${awaitingReviewCount} ${awaitingReviewCount === 1 ? "invoice" : "invoices"}`,
      subtext: awaitingReviewAmount > 0 ? `$${Number(awaitingReviewAmount).toLocaleString()}` : null,
      icon: FiClock,
      bg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
    },
    {
      id: "awaiting_payment",
      label: "Awaiting Payment",
      value: `${awaitingPaymentCount} ${awaitingPaymentCount === 1 ? "invoice" : "invoices"}`,
      subtext: awaitingPaymentAmount > 0 ? `$${Number(awaitingPaymentAmount).toLocaleString()}` : null,
      icon: FiCheckCircle,
      bg: "bg-[#E3F2FD]",
      iconColor: "text-[#1565C0]",
    },
    {
      id: "paid_earnings",
      label: "Paid Earnings",
      value: `$${Number(actualPaidAmount).toLocaleString()}`,
      subtext: paidThisMonth > 0 ? `This mo: $${Number(paidThisMonth).toLocaleString()}` : null,
      icon: FiTrendingUp,
      bg: "bg-[#E8F5E9]",
      iconColor: "text-[#2E7D32]",
    },
  ];

  return (
    <div className="space-y-3">
      {overdueCount > 0 && (
        <div className="bg-[#FFF3E0] border border-[#FF9800]/30 text-[#E65100] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="text-sm shrink-0 text-[#F57C00]" />
            <span>
              {overdueCount} {overdueCount === 1 ? "invoice is" : "invoices are"} overdue and unpaid (${Number(overdueAmount).toLocaleString()} outstanding).
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cardItems.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className="bg-white border border-[#E8E2DE] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                {/* Icon Container */}
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.iconColor} flex items-center justify-center shrink-0 border border-black/5`}
                >
                  <Icon className="text-lg" />
                </div>

                {/* Label & Value */}
                <div>
                  <p className="text-[11px] font-medium text-[#817B77]">
                    {stat.label}
                  </p>
                  <h3 className="text-xl font-bold text-[#3E3734] mt-0.5">
                    {stat.value}
                  </h3>
                </div>
              </div>

              {/* Subtext */}
              {stat.subtext && (
                <span className="text-[10px] font-semibold text-[#817B77] bg-[#FAF7F5] border border-[#F2EBE5] px-2 py-1 rounded-lg shrink-0">
                  {stat.subtext}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceStats;
