import type { LucideIcon } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/core/ThemeContext";

interface NavBtnProps {
  label: string;
  icon: LucideIcon;
  index: number;
  to?: string;
  href?: string;
}

export const NavBtn: React.FC<NavBtnProps> = ({ label, icon: Icon, to, href, index }) => {
  const { colors, isDarkMode } = useTheme();

  const gradient = colors.navBtnGradients[index % colors.navBtnGradients.length];

  const sharedStyle = {
    backgroundImage: `linear-gradient(to top right, ${gradient.from}, ${gradient.to})`,
    backgroundColor: "transparent",
    borderColor: colors.border,
    color: colors.text1,
  };

  const baseClass =
    "flex flex-col items-center justify-center w-[7.2rem] h-[7.2rem] rounded-full border-[2px] shadow-2xl";

  const content = (
    <>
      <Icon size={32} style={{ color: "inherit" }} />
      <span
        className="font-cinzel mt-1 text-[0.6rem] font-bold tracking-widest uppercase text-center px-2 leading-tight"
        style={{ color: "inherit" }}
      >
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={sharedStyle}
        className={`${baseClass} opacity-90`}
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <NavLink
        key={isDarkMode ? "dark" : "light"}
        to={to}
        style={sharedStyle}
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "!border-white scale-110 z-20 shadow-white/20" : "opacity-90"}`
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <div style={sharedStyle} className={`${baseClass} opacity-40 cursor-default`}>
      {content}
    </div>
  );
};
