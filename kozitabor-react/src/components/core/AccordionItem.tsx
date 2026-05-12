import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useTheme } from "../../context/core/ThemeContext";

interface AccordionItemProps {
  label: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  label,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  return (
    <div style={{ borderBottom: `1px solid ${colors.border}` }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-3 px-1 text-left gap-3"
        style={{ color: colors.text2 }}
      >
        <span className="font-medium text-sm flex-1">{label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: colors.icon }}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-1 pb-3 pt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
};
