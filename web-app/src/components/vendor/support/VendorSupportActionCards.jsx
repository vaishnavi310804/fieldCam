import React from "react";
import {
  FiPlus,
  FiMessageSquare,
  FiPhone,
  FiHelpCircle,
} from "react-icons/fi";

const VendorSupportActionCards = ({ onOpenRaiseTicket }) => {
  const cards = [
    {
      id: "raise-ticket",
      title: "Raise Ticket",
      description: "Submit a new support request and track its progress",
      icon: FiPlus,
      iconBg: "bg-[#FBE9E7] text-[#D84315]",
      accentCircleBg: "bg-[#FBE9E7]/40",
      badge: null,
      onClick: onOpenRaiseTicket,
      isPrimary: true,
    },
    {
      id: "live-chat",
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: FiMessageSquare,
      iconBg: "bg-[#E8F5E9] text-[#2E7D32]",
      accentCircleBg: "bg-[#E8F5E9]/40",
      badge: "Online",
      badgeClass: "bg-[#E8F5E9] text-[#2E7D32]",
      isPrimary: false,
    },
    {
      id: "phone-support",
      title: "Call Support",
      description: "Speak directly with a support agent",
      icon: FiPhone,
      iconBg: "bg-[#E3F2FD] text-[#1565C0]",
      accentCircleBg: "bg-[#E3F2FD]/40",
      badge: "Mon-Fri",
      badgeClass: "bg-[#E3F2FD] text-[#1565C0]",
      isPrimary: false,
    },
    {
      id: "help-center",
      title: "FAQ",
      description: "Browse answers to common questions",
      icon: FiHelpCircle,
      iconBg: "bg-[#FFF3E0] text-[#E65100]",
      accentCircleBg: "bg-[#FFF3E0]/40",
      badge: "",
      badgeClass: "bg-[#FFF3E0] text-[#E65100]",
      isPrimary: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.isPrimary ? card.onClick : undefined}
            className={`bg-white rounded-2xl p-4 border border-[#E8E2DE] shadow-2xs relative overflow-hidden flex flex-col justify-between transition-all ${
              card.isPrimary
                ? "cursor-pointer hover:shadow-sm hover:border-[#C8B5AC] group"
                : "opacity-95"
            } min-h-[96px]`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                    card.isPrimary ? "group-hover:scale-105" : ""
                  } ${card.iconBg}`}
                >
                  <Icon />
                </div>
                {card.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${card.badgeClass}`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-[#3E3734] tracking-tight mb-0.5">
                {card.title}
              </h3>
              <p className="text-[11px] text-[#817B77] leading-tight max-w-xs">
                {card.description}
              </p>
            </div>

            {/* Subtle decorative background circle */}
            <div
              className={`absolute -bottom-5 -right-5 w-20 h-20 rounded-full ${card.accentCircleBg} pointer-events-none transition-transform duration-300 ${
                card.isPrimary ? "group-hover:scale-110" : ""
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VendorSupportActionCards;
