import React from 'react';
import { NavLink } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline' | 'success';
  icon?: React.ReactNode;
  to?: string;
}

const AdminButton: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className, to, ...props }) => {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 text-sm";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
  };

  const content = (
    <>
      {icon && <span>{icon}</span>}
      {children}
    </>
  );

  if (to) {
    return (
      <NavLink to={to} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {content}
      </NavLink>
    );
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {content}
    </button>
  );
};

export default AdminButton;