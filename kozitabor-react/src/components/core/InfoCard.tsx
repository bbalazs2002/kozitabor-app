import { ChevronRight, type LucideIcon } from "lucide-react";
import React from "react";
import { useTheme } from "../../context/core/ThemeContext";
import { Button } from "./Button";

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  buttonText?: string;
  buttonColor?: string;
  buttonTo?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const SKELETON_WIDTHS = ["80%", "60%", "72%", "50%"];

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon: Icon,
  buttonText,
  buttonColor,
  buttonTo,
  loading,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <div
      className="w-full max-w-[25rem] rounded-[1.875rem] border p-[1.375rem] mb-[1.125rem] relative z-10 shadow-lg"
      style={{
        // Gradiens háttér a paletta szerint
        backgroundImage: `linear-gradient(to bottom right, ${colors.cardBgGradient.from}, ${colors.cardBgGradient.to})`,
        // Keret színe (sötét módban 40% opacity-vel)
        borderColor: colors.border,
        // Árnyék finomhangolása
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* HEADER: ICON + TITLE */}
      <div className="flex items-center mb-4">
        <Icon size={22} className="mr-3" color={colors.icon} />
        <h3 className="font-cinzel text-lg" style={{ color: colors.text2 }}>
          {title}
        </h3>
      </div>

      {/* CONTENT AREA */}
      <div className="space-y-0">
        {loading ? (
          <div className="space-y-3 py-1 animate-pulse">
            {SKELETON_WIDTHS.map((w, i) => (
              <div
                key={i}
                className="h-3 rounded-full"
                style={{ width: w, backgroundColor: `${colors.border}70` }}
              />
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* OPTIONAL ACTION BUTTON */}
      {buttonText && (
        <div className="flex justify-end w-full mt-4">
          <Button color={buttonColor} to={buttonTo}>
            <span className="flex items-center gap-1">
              {buttonText} <ChevronRight size={16} />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};
